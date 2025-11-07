var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-o2i6jh/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// payment_service.js
var PaymentService = class {
  static {
    __name(this, "PaymentService");
  }
  constructor(env) {
    this.env = env;
    this.circleApiKey = env.CIRCLE_API_KEY;
    this.entitySecret = env.ENTITY_SECRET;
    this.circleApiUrl = "https://api.circle.com/v1";
  }
  /**
   * Process micropayment for content
   */
  async processMicropayment(userId, decision, env) {
    if (!decision.shouldPay) {
      throw new Error("Payment decision is negative");
    }
    const wallet = await this.getUserWallet(userId, env);
    const transaction = await this.sendPayment(
      wallet.walletId,
      decision.creatorAddress,
      decision.amount,
      decision.contentId
    );
    return transaction;
  }
  /**
   * Get user wallet from KV or create new one
   */
  async getUserWallet(userId, env) {
    const walletKey = `wallet-${userId}`;
    let walletData = await env.USER_PREFS.get(walletKey);
    if (walletData) {
      return JSON.parse(walletData);
    }
    const wallet = await this.createWallet(userId);
    await env.USER_PREFS.put(walletKey, JSON.stringify(wallet));
    return wallet;
  }
  /**
   * Create wallet using Circle API
   */
  async createWallet(userId) {
    try {
      const response = await fetch(`${this.circleApiUrl}/wallets`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.circleApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idempotencyKey: `wallet-${userId}-${Date.now()}`,
          accountType: "SCA",
          blockchains: ["ARB-SEPOLIA"],
          count: 1,
          walletSetId: userId
        })
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Circle API error: ${error}`);
      }
      const data = await response.json();
      const wallet = data.data.wallets[0];
      return {
        address: wallet.address,
        walletId: wallet.id,
        userId,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("Error creating wallet:", error);
      throw error;
    }
  }
  /**
   * Send USDC payment
   */
  async sendPayment(fromWalletId, toAddress, amount, contentId) {
    try {
      const balance = await this.getWalletBalance(fromWalletId);
      if (balance < amount) {
        throw new Error(`Insufficient balance: ${balance} USDC available, ${amount} USDC required`);
      }
      const response = await fetch(`${this.circleApiUrl}/w3s/developer/transactions/transfer`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.circleApiKey}`,
          "Content-Type": "application/json",
          "X-User-Token": this.entitySecret
        },
        body: JSON.stringify({
          idempotencyKey: `payment-${contentId}-${Date.now()}`,
          walletId: fromWalletId,
          blockchain: "ARB-SEPOLIA",
          destinationAddress: toAddress,
          tokenAddress: this.env.USDC_ADDRESS || "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
          amounts: [amount.toString()],
          fee: {
            type: "level",
            config: {
              feeLevel: "MEDIUM"
            }
          }
        })
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Circle transaction error: ${error}`);
      }
      const data = await response.json();
      const tx = data.data.transaction;
      return {
        txHash: tx.txHash || tx.id,
        from: fromWalletId,
        to: toAddress,
        amount,
        contentId,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        status: tx.state || "PENDING"
      };
    } catch (error) {
      console.error("Error sending payment:", error);
      throw error;
    }
  }
  /**
   * Get wallet balance
   */
  async getWalletBalance(walletId) {
    try {
      const response = await fetch(`${this.circleApiUrl}/wallets/${walletId}`, {
        headers: {
          "Authorization": `Bearer ${this.circleApiKey}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to get balance: ${response.status}`);
      }
      const data = await response.json();
      const usdcBalance = data.data.wallet.balances?.find(
        (b) => b.token.symbol === "USDC"
      );
      return parseFloat(usdcBalance?.amount || "0");
    } catch (error) {
      console.error("Error getting balance:", error);
      return 0;
    }
  }
  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash) {
    try {
      const response = await fetch(`${this.circleApiUrl}/w3s/transactions/${txHash}`, {
        headers: {
          "Authorization": `Bearer ${this.circleApiKey}`
        }
      });
      if (!response.ok) {
        return "UNKNOWN";
      }
      const data = await response.json();
      return data.data.transaction.state;
    } catch (error) {
      console.error("Error getting transaction status:", error);
      return "UNKNOWN";
    }
  }
};

// openai_service.js
var OpenAIService = class {
  static {
    __name(this, "OpenAIService");
  }
  constructor(env) {
    this.env = env;
    this.openaiKey = env.OPENAI_API_KEY;
  }
  /**
   * Analyze content using AI
   * @param {Object} content 
   * @param {Object} userPreferences 
   */
  async analyzeContent(content, userPreferences) {
    if (this.env.AI) {
      return await this.analyzeWithCloudflareAI(content, userPreferences);
    }
    if (this.openaiKey) {
      return await this.analyzeWithOpenAI(content, userPreferences);
    }
    return this.fallbackAnalysis(content, userPreferences);
  }
  /**
   * Analyze using Cloudflare AI (Workers AI)
   * Available on Workers Paid plan
   */
  async analyzeWithCloudflareAI(content, userPreferences) {
    try {
      const prompt = this.buildAnalysisPrompt(content, userPreferences);
      const response = await this.env.AI.run("@cf/meta/llama-2-7b-chat-int8", {
        messages: [
          {
            role: "system",
            content: "You are a content analyst. Provide quality and relevance scores (0-1)."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });
      const text = response.response || "";
      return {
        qualityScore: this.extractScore(text, "quality") || 0.7,
        relevanceScore: this.extractScore(text, "relevance") || 0.5,
        detectedTopics: content.tags || [],
        estimatedValue: content.price || 0.25,
        summary: text.substring(0, 200)
      };
    } catch (error) {
      console.error("Cloudflare AI error:", error);
      return this.fallbackAnalysis(content, userPreferences);
    }
  }
  /**
   * Analyze using OpenAI API
   */
  async analyzeWithOpenAI(content, userPreferences) {
    try {
      const prompt = this.buildAnalysisPrompt(content, userPreferences);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.openaiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are a content analyst. Respond only in JSON format."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: "json_object" }
        })
      });
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);
      return {
        qualityScore: analysis.qualityScore || 0.7,
        relevanceScore: analysis.relevanceScore || 0.5,
        detectedTopics: analysis.detectedTopics || content.tags || [],
        estimatedValue: analysis.estimatedValue || content.price || 0.25,
        summary: analysis.summary || "No summary available"
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      return this.fallbackAnalysis(content, userPreferences);
    }
  }
  /**
   * Fallback analysis using keyword matching
   */
  fallbackAnalysis(content, userPreferences) {
    const userKeywords = userPreferences.interests?.map((i) => i.toLowerCase()) || [];
    const contentKeywords = [
      ...content.tags?.map((t) => t.toLowerCase()) || [],
      content.title.toLowerCase()
    ];
    const matchCount = contentKeywords.filter(
      (k) => userKeywords.some((uk) => k.includes(uk) || uk.includes(k))
    ).length;
    const relevanceScore = Math.min(matchCount / Math.max(userKeywords.length, 1), 1);
    return {
      qualityScore: 0.7,
      relevanceScore,
      detectedTopics: content.tags || [],
      estimatedValue: content.price || 0.25,
      summary: content.description || "No summary available"
    };
  }
  /**
   * Make payment decision based on analysis
   */
  async makePaymentDecision(content, analysis, userPreferences) {
    const minQualityScore = parseFloat(this.env.MIN_QUALITY_SCORE || "0.7");
    if (analysis.qualityScore < minQualityScore) {
      return {
        shouldPay: false,
        amount: 0,
        reason: "Content quality below threshold",
        confidenceScore: 0.9,
        contentId: content.contentId,
        creatorAddress: content.creatorAddress
      };
    }
    const baseAmount = content.price || analysis.estimatedValue * 0.25;
    const adjustedAmount = baseAmount * analysis.relevanceScore * analysis.qualityScore;
    const minThreshold = parseFloat(this.env.PAYMENT_THRESHOLD || "0.10");
    if (adjustedAmount < minThreshold) {
      return {
        shouldPay: false,
        amount: 0,
        reason: "Payment amount below threshold",
        confidenceScore: 0.8,
        contentId: content.contentId,
        creatorAddress: content.creatorAddress
      };
    }
    const isFavorite = userPreferences.favoriteCreators?.includes(content.creatorAddress);
    return {
      shouldPay: true,
      amount: adjustedAmount,
      reason: isFavorite ? "Favorite creator with high-quality content" : "Content meets quality and relevance criteria",
      confidenceScore: (analysis.qualityScore + analysis.relevanceScore) / 2,
      contentId: content.contentId,
      creatorAddress: content.creatorAddress
    };
  }
  /**
   * Recommend content
   */
  async recommendContent(userPreferences, availableContent) {
    if (!availableContent || availableContent.length === 0) {
      return [];
    }
    const scored = await Promise.all(
      availableContent.map(async (content) => {
        const analysis = await this.analyzeContent(content, userPreferences);
        return {
          ...content,
          score: (analysis.qualityScore + analysis.relevanceScore) / 2
        };
      })
    );
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 10).map(({ score, ...content }) => content);
  }
  /**
   * Build analysis prompt
   */
  buildAnalysisPrompt(content, userPreferences) {
    return `Analyze this content and provide scores:

Content:
- Title: ${content.title}
- Type: ${content.type}
- Description: ${content.description}
- Tags: ${content.tags?.join(", ")}
- Price: $${content.price}

User Interests: ${userPreferences.interests?.join(", ")}

Provide JSON with:
{
  "qualityScore": 0-1,
  "relevanceScore": 0-1,
  "detectedTopics": ["topic1", "topic2"],
  "estimatedValue": suggested USD price,
  "summary": brief summary
}`;
  }
  /**
   * Extract score from text response
   */
  extractScore(text, type) {
    const regex = new RegExp(`${type}[:\\s]+([0-9.]+)`, "i");
    const match = text.match(regex);
    return match ? parseFloat(match[1]) : null;
  }
};

// subscription_service.js
var SubscriptionService = class {
  static {
    __name(this, "SubscriptionService");
  }
  constructor(env) {
    this.env = env;
    this.paymentService = new PaymentService(env);
  }
  /**
   * Create new subscription
   */
  async createSubscription(userId, creatorAddress, amount, env) {
    const subscriptionId = `${userId}-${creatorAddress}-${Date.now()}`;
    const nextPaymentDate = /* @__PURE__ */ new Date();
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
    const subscription = {
      subscriptionId,
      userId,
      creatorAddress,
      amount,
      nextPaymentDate: nextPaymentDate.toISOString(),
      active: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastPaymentDate: (/* @__PURE__ */ new Date()).toISOString()
    };
    await env.SUBSCRIPTIONS.put(subscriptionId, JSON.stringify(subscription));
    try {
      await this.processPayment(subscriptionId, env);
    } catch (error) {
      console.error("First payment failed:", error);
    }
    return subscription;
  }
  /**
   * Process subscription payment
   */
  async processPayment(subscriptionId, env) {
    const subData = await env.SUBSCRIPTIONS.get(subscriptionId);
    if (!subData) {
      throw new Error("Subscription not found");
    }
    const subscription = JSON.parse(subData);
    if (!subscription.active) {
      throw new Error("Subscription is not active");
    }
    const decision = {
      shouldPay: true,
      amount: subscription.amount,
      reason: "Subscription payment",
      confidenceScore: 1,
      contentId: `sub-${subscriptionId}`,
      creatorAddress: subscription.creatorAddress
    };
    const transaction = await this.paymentService.processMicropayment(
      subscription.userId,
      decision,
      env
    );
    subscription.lastPaymentDate = (/* @__PURE__ */ new Date()).toISOString();
    const nextPaymentDate = /* @__PURE__ */ new Date();
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
    subscription.nextPaymentDate = nextPaymentDate.toISOString();
    await env.SUBSCRIPTIONS.put(subscriptionId, JSON.stringify(subscription));
    return transaction;
  }
  /**
   * Check for due subscriptions (called by cron)
   */
  async checkDueSubscriptions() {
    const now = /* @__PURE__ */ new Date();
    const listResult = await this.env.SUBSCRIPTIONS.list();
    for (const key of listResult.keys) {
      try {
        const subData = await this.env.SUBSCRIPTIONS.get(key.name);
        const subscription = JSON.parse(subData);
        if (subscription.active && new Date(subscription.nextPaymentDate) <= now) {
          console.log(`Processing due subscription: ${subscription.subscriptionId}`);
          await this.processPayment(subscription.subscriptionId, this.env);
        }
      } catch (error) {
        console.error(`Failed to process subscription ${key.name}:`, error);
      }
    }
  }
  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, env) {
    const subData = await env.SUBSCRIPTIONS.get(subscriptionId);
    if (!subData) {
      return false;
    }
    const subscription = JSON.parse(subData);
    subscription.active = false;
    subscription.cancelledAt = (/* @__PURE__ */ new Date()).toISOString();
    await env.SUBSCRIPTIONS.put(subscriptionId, JSON.stringify(subscription));
    return true;
  }
  /**
   * Reactivate subscription
   */
  async reactivateSubscription(subscriptionId, env) {
    const subData = await env.SUBSCRIPTIONS.get(subscriptionId);
    if (!subData) {
      return false;
    }
    const subscription = JSON.parse(subData);
    subscription.active = true;
    delete subscription.cancelledAt;
    const nextPaymentDate = /* @__PURE__ */ new Date();
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
    subscription.nextPaymentDate = nextPaymentDate.toISOString();
    await env.SUBSCRIPTIONS.put(subscriptionId, JSON.stringify(subscription));
    return true;
  }
};

// index.js
var index_default = {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const paymentService = new PaymentService(env);
      const openaiService = new OpenAIService(env);
      const subscriptionService = new SubscriptionService(env);
      let response;
      if (path === "/health") {
        response = await handleHealth(env);
      } else if (path.match(/^\/api\/users\/[^/]+\/preferences$/)) {
        const userId = path.split("/")[3];
        if (request.method === "POST") {
          response = await handleSetPreferences(request, userId, env);
        } else if (request.method === "GET") {
          response = await handleGetPreferences(userId, env);
        }
      } else if (path.match(/^\/api\/users\/[^/]+\/content\/process$/)) {
        const userId = path.split("/")[3];
        response = await handleProcessContent(
          request,
          userId,
          env,
          openaiService,
          paymentService
        );
      } else if (path.match(/^\/api\/users\/[^/]+\/recommendations$/)) {
        const userId = path.split("/")[3];
        response = await handleRecommendations(request, userId, env, openaiService);
      } else if (path.match(/^\/api\/users\/[^/]+\/tip$/)) {
        const userId = path.split("/")[3];
        response = await handleSendTip(request, userId, env, paymentService);
      } else if (path.match(/^\/api\/users\/[^/]+\/subscriptions$/)) {
        const userId = path.split("/")[3];
        if (request.method === "POST") {
          response = await handleCreateSubscription(
            request,
            userId,
            env,
            subscriptionService
          );
        } else if (request.method === "GET") {
          response = await handleGetSubscriptions(userId, env);
        }
      } else if (path === "/api/statistics") {
        response = await handleStatistics(env);
      } else if ((path === "/auth/signup" || path === "/api/auth/signup") && request.method === "POST") {
        response = await handleSignUp(request, env);
      } else if ((path === "/auth/signin" || path === "/api/auth/signin") && request.method === "POST") {
        response = await handleSignIn(request, env);
      } else {
        response = jsonResponse({ error: "Not found" }, 404);
      }
      Object.keys(corsHeaders).forEach((key) => {
        response.headers.set(key, corsHeaders[key]);
      });
      return response;
    } catch (error) {
      console.error("Worker error:", error);
      return jsonResponse(
        { error: "Internal server error", message: error.message },
        500,
        corsHeaders
      );
    }
  },
  /**
   * Cron trigger for subscription checks
   * Runs every hour to process due subscriptions
   */
  async scheduled(event, env, ctx) {
    console.log("Running scheduled subscription check...");
    try {
      const subscriptionService = new SubscriptionService(env);
      await subscriptionService.checkDueSubscriptions();
      console.log("Subscription check completed successfully");
    } catch (error) {
      console.error("Subscription check failed:", error);
    }
  }
};
async function handleHealth(env) {
  return jsonResponse({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: "1.0.0",
    environment: env.ENVIRONMENT || "development",
    edge: true
    // Cloudflare Workers runs on edge
  });
}
__name(handleHealth, "handleHealth");
async function handleSetPreferences(request, userId, env) {
  const preferences = await request.json();
  await env.USER_PREFS.put(
    userId,
    JSON.stringify({
      ...preferences,
      userId,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    })
  );
  return jsonResponse({
    success: true,
    message: "Preferences saved",
    preferences
  });
}
__name(handleSetPreferences, "handleSetPreferences");
async function handleGetPreferences(userId, env) {
  const prefsData = await env.USER_PREFS.get(userId);
  if (!prefsData) {
    return jsonResponse({ error: "Preferences not found" }, 404);
  }
  return jsonResponse({
    success: true,
    preferences: JSON.parse(prefsData)
  });
}
__name(handleGetPreferences, "handleGetPreferences");
async function handleProcessContent(request, userId, env, openaiService, paymentService) {
  const content = await request.json();
  const prefsData = await env.USER_PREFS.get(userId);
  if (!prefsData) {
    return jsonResponse({ error: "User preferences not found" }, 404);
  }
  const preferences = JSON.parse(prefsData);
  const today = (/* @__PURE__ */ new Date()).toDateString();
  const spendingKey = `${userId}-${today}`;
  const dailySpending = parseFloat(await env.PAYMENT_HISTORY.get(spendingKey) || "0");
  if (dailySpending >= preferences.maxDailyBudget) {
    return jsonResponse({
      success: true,
      decision: {
        shouldPay: false,
        amount: 0,
        reason: "Daily budget exceeded",
        confidenceScore: 1,
        contentId: content.contentId,
        creatorAddress: content.creatorAddress
      }
    });
  }
  const analysis = await openaiService.analyzeContent(content, preferences);
  const decision = await openaiService.makePaymentDecision(content, analysis, preferences);
  if (decision.shouldPay) {
    const remainingBudget = preferences.maxDailyBudget - dailySpending;
    if (decision.amount > remainingBudget) {
      decision.shouldPay = false;
      decision.reason = "Would exceed daily budget";
    } else {
      try {
        const transaction = await paymentService.processMicropayment(
          userId,
          decision,
          env
        );
        await env.PAYMENT_HISTORY.put(
          spendingKey,
          String(dailySpending + decision.amount),
          { expirationTtl: 86400 }
          // Expire after 24 hours
        );
        const txKey = `tx-${transaction.txHash}`;
        await env.PAYMENT_HISTORY.put(
          txKey,
          JSON.stringify({
            userId,
            contentId: content.contentId,
            transaction,
            decision,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          })
        );
        return jsonResponse({
          success: true,
          decision,
          transaction
        });
      } catch (error) {
        console.error("Payment failed:", error);
        decision.shouldPay = false;
        decision.reason = `Payment failed: ${error.message}`;
      }
    }
  }
  return jsonResponse({
    success: true,
    decision
  });
}
__name(handleProcessContent, "handleProcessContent");
async function handleRecommendations(request, userId, env, openaiService) {
  const { content } = await request.json();
  const prefsData = await env.USER_PREFS.get(userId);
  if (!prefsData) {
    return jsonResponse({ error: "User preferences not found" }, 404);
  }
  const preferences = JSON.parse(prefsData);
  const recommendations = await openaiService.recommendContent(preferences, content);
  return jsonResponse({
    success: true,
    recommendations
  });
}
__name(handleRecommendations, "handleRecommendations");
async function handleSendTip(request, userId, env, paymentService) {
  const { creatorAddress, amount } = await request.json();
  if (!creatorAddress || !amount) {
    return jsonResponse({ error: "Missing required fields" }, 400);
  }
  const prefsData = await env.USER_PREFS.get(userId);
  if (!prefsData) {
    return jsonResponse({ error: "User preferences not found" }, 404);
  }
  const preferences = JSON.parse(prefsData);
  const today = (/* @__PURE__ */ new Date()).toDateString();
  const spendingKey = `${userId}-${today}`;
  const dailySpending = parseFloat(await env.PAYMENT_HISTORY.get(spendingKey) || "0");
  const remainingBudget = preferences.maxDailyBudget - dailySpending;
  if (amount > remainingBudget) {
    return jsonResponse({
      error: `Tip exceeds remaining daily budget (${remainingBudget} USD)`
    }, 400);
  }
  const decision = {
    shouldPay: true,
    amount,
    reason: "Manual tip",
    confidenceScore: 1,
    contentId: "tip-" + Date.now(),
    creatorAddress
  };
  const transaction = await paymentService.processMicropayment(userId, decision, env);
  await env.PAYMENT_HISTORY.put(
    spendingKey,
    String(dailySpending + amount),
    { expirationTtl: 86400 }
  );
  return jsonResponse({
    success: true,
    message: "Tip sent successfully",
    transaction
  });
}
__name(handleSendTip, "handleSendTip");
async function handleCreateSubscription(request, userId, env, subscriptionService) {
  const { creatorAddress, amount } = await request.json();
  if (!creatorAddress || !amount) {
    return jsonResponse({ error: "Missing required fields" }, 400);
  }
  const subscription = await subscriptionService.createSubscription(
    userId,
    creatorAddress,
    amount,
    env
  );
  return jsonResponse({
    success: true,
    message: "Subscription created",
    subscription
  });
}
__name(handleCreateSubscription, "handleCreateSubscription");
async function handleGetSubscriptions(userId, env) {
  const listResult = await env.SUBSCRIPTIONS.list({ prefix: `${userId}-` });
  const subscriptions = await Promise.all(
    listResult.keys.map(async (key) => {
      const data = await env.SUBSCRIPTIONS.get(key.name);
      return JSON.parse(data);
    })
  );
  return jsonResponse({
    success: true,
    subscriptions
  });
}
__name(handleGetSubscriptions, "handleGetSubscriptions");
async function handleStatistics(env) {
  return jsonResponse({
    success: true,
    statistics: {
      message: "Statistics aggregation from KV in progress",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
}
__name(handleStatistics, "handleStatistics");
async function handleSignUp(request, env) {
  const { email, password, name } = await request.json();
  if (!email || !password || !name) {
    return jsonResponse({ error: "Missing required fields" }, 400);
  }
  const existingUser = await env.USERS.get(`user:${email}`);
  if (existingUser) {
    return jsonResponse({ error: "User with this email already exists" }, 409);
  }
  const user = { email, password, name, userId: `user-${Date.now()}` };
  await env.USERS.put(`user:${email}`, JSON.stringify(user));
  const token = `fake-token-${Date.now()}`;
  const { password: _, ...userWithoutPassword } = user;
  return jsonResponse({
    success: true,
    message: "User created successfully",
    user: userWithoutPassword,
    token
  }, 201);
}
__name(handleSignUp, "handleSignUp");
async function handleSignIn(request, env) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return jsonResponse({ error: "Missing required fields" }, 400);
  }
  let userData = await env.USERS.get(`user:${email}`);
  if (!userData && email === "demo@arcpay.com" && password === "Demo@123") {
    const demoUser = { email, password, name: "Demo User", userId: "user-demo" };
    await env.USERS.put(`user:${email}`, JSON.stringify(demoUser));
    userData = JSON.stringify(demoUser);
  }
  if (userData) {
    const user = JSON.parse(userData);
    if (user.password === password) {
      const token = `fake-token-${Date.now()}`;
      const { password: _, ...userWithoutPassword } = user;
      return jsonResponse({
        success: true,
        message: "Sign-in successful",
        user: userWithoutPassword,
        token
      });
    }
  }
  return jsonResponse({ error: "Invalid credentials" }, 401);
}
__name(handleSignIn, "handleSignIn");
function jsonResponse(data, status = 200, additionalHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...additionalHeaders
    }
  });
}
__name(jsonResponse, "jsonResponse");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-o2i6jh/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = index_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-o2i6jh/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
