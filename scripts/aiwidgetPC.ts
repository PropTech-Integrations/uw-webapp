// ai-dashboard-example.ts
// An AI-powered dashboard where widgets consume data and AI agents produce insights

import { mapStore } from '../src/lib/stores/mapObjectStore';
import type { Unsubscriber } from 'svelte/store';

// ============================================
// DATA TYPE DEFINITIONS
// ============================================

interface MetricData {
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  timestamp: Date;
}

interface TimeSeriesData {
  label: string;
  dataPoints: Array<{
    time: Date;
    value: number;
  }>;
  aggregation: 'sum' | 'avg' | 'max' | 'min';
}

interface CategoryBreakdown {
  categories: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  total: number;
}

interface AlertData {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  actionRequired: boolean;
}

interface PredictionData {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeHorizon: string;
  factors: string[];
}

interface AnomalyData {
  id: string;
  metric: string;
  detectedAt: Date;
  severity: number; // 0-100
  description: string;
  affectedSystems: string[];
  suggestedAction?: string;
}

interface SentimentData {
  overall: 'positive' | 'neutral' | 'negative';
  score: number; // -1 to 1
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topTopics: Array<{
    topic: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    mentions: number;
  }>;
}

interface PerformanceData {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    inbound: number;
    outbound: number;
  };
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
  }>;
}

interface RecommendationData {
  id: string;
  type: 'optimization' | 'security' | 'cost' | 'performance';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedSavings?: number;
  implementation: string[];
  aiConfidence: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: Record<string, any>;
}

// ============================================
// AI AGENTS (Producers)
// ============================================

class MetricsAIAgent {
  private name = 'MetricsAI';
  private salesMetric = mapStore.registerProducer<MetricData>('sales-metric', `${this.name}-sales`);
  private revenueMetric = mapStore.registerProducer<MetricData>('revenue-metric', `${this.name}-revenue`);
  private userMetric = mapStore.registerProducer<MetricData>('users-metric', `${this.name}-users`);
  
  constructor() {
    console.log('🤖 MetricsAI Agent: Initialized');
    this.startMonitoring();
  }

  private startMonitoring() {
    // Simulate real-time metrics updates
    setInterval(() => {
      this.salesMetric.publish({
        value: 15234 + Math.random() * 1000,
        unit: 'orders',
        trend: Math.random() > 0.5 ? 'up' : 'down',
        changePercent: (Math.random() - 0.5) * 20,
        timestamp: new Date()
      });

      this.revenueMetric.publish({
        value: 524300 + Math.random() * 50000,
        unit: 'USD',
        trend: Math.random() > 0.3 ? 'up' : 'stable',
        changePercent: (Math.random() - 0.3) * 15,
        timestamp: new Date()
      });

      this.userMetric.publish({
        value: 8453 + Math.floor(Math.random() * 500),
        unit: 'active users',
        trend: 'up',
        changePercent: Math.random() * 10,
        timestamp: new Date()
      });
    }, 3000);
  }
}

class PredictiveAIAgent {
  private name = 'PredictiveAI';
  private predictions = mapStore.registerProducer<PredictionData[]>('predictions', this.name);
  private timeSeriesConsumer = mapStore.registerConsumer<TimeSeriesData>('timeseries-revenue', `${this.name}-consumer`);
  
  constructor() {
    console.log('🔮 PredictiveAI Agent: Initialized');
    
    // React to time series data to make predictions
    this.timeSeriesConsumer.subscribe(data => {
      if (data) {
        this.generatePredictions(data);
      }
    });
    
    // Also generate some standalone predictions
    this.generateInitialPredictions();
  }

  private generatePredictions(timeSeriesData: TimeSeriesData) {
    const lastValue = timeSeriesData.dataPoints[timeSeriesData.dataPoints.length - 1]?.value || 0;
    
    const predictions: PredictionData[] = [
      {
        metric: 'Revenue Growth',
        currentValue: lastValue,
        predictedValue: lastValue * 1.15,
        confidence: 0.82,
        timeHorizon: 'Next Quarter',
        factors: ['Seasonal trends', 'Marketing campaign impact', 'Market expansion']
      },
      {
        metric: 'Customer Churn',
        currentValue: 5.2,
        predictedValue: 4.8,
        confidence: 0.75,
        timeHorizon: 'Next Month',
        factors: ['Improved onboarding', 'Feature updates', 'Support response time']
      },
      {
        metric: 'System Load',
        currentValue: 65,
        predictedValue: 78,
        confidence: 0.90,
        timeHorizon: 'Next Week',
        factors: ['Holiday traffic', 'New feature launch', 'Marketing campaign']
      }
    ];
    
    console.log('🔮 PredictiveAI: Generated predictions based on time series data');
    this.predictions.publish(predictions);
  }

  private generateInitialPredictions() {
    setTimeout(() => {
      const predictions: PredictionData[] = [
        {
          metric: 'User Acquisition',
          currentValue: 1200,
          predictedValue: 1450,
          confidence: 0.78,
          timeHorizon: 'Next Month',
          factors: ['SEO improvements', 'Referral program', 'Content marketing']
        }
      ];
      this.predictions.publish(predictions);
    }, 2000);
  }
}

class AnomalyDetectionAgent {
  private name = 'AnomalyAI';
  private anomalies = mapStore.registerProducer<AnomalyData[]>('anomalies', this.name, []);
  private performanceConsumer = mapStore.registerConsumer<PerformanceData>('performance', `${this.name}-perf`);
  private metricsConsumer = mapStore.registerConsumer<MetricData>('revenue-metric', `${this.name}-metrics`);
  
  private anomalyCount = 0;

  constructor() {
    console.log('🚨 AnomalyDetection Agent: Initialized');
    
    // Monitor performance data for anomalies
    this.performanceConsumer.subscribe(perf => {
      if (perf) {
        this.analyzePerformance(perf);
      }
    });

    // Monitor metrics for unusual patterns
    this.metricsConsumer.subscribe(metric => {
      if (metric && Math.abs(metric.changePercent) > 15) {
        this.detectMetricAnomaly(metric);
      }
    });
  }

  private analyzePerformance(perf: PerformanceData) {
    const anomalies: AnomalyData[] = [];
    
    if (perf.cpu > 85) {
      anomalies.push({
        id: `anomaly-${++this.anomalyCount}`,
        metric: 'CPU Usage',
        detectedAt: new Date(),
        severity: perf.cpu > 95 ? 90 : 60,
        description: `Abnormally high CPU usage detected: ${perf.cpu.toFixed(1)}%`,
        affectedSystems: ['API Server', 'Database'],
        suggestedAction: 'Scale up instances or optimize queries'
      });
    }

    if (perf.memory > 80) {
      anomalies.push({
        id: `anomaly-${++this.anomalyCount}`,
        metric: 'Memory Usage',
        detectedAt: new Date(),
        severity: 70,
        description: `Memory usage approaching critical levels: ${perf.memory.toFixed(1)}%`,
        affectedSystems: ['Cache Service'],
        suggestedAction: 'Clear cache or increase memory allocation'
      });
    }

    const downServices = perf.services.filter(s => s.status === 'down');
    if (downServices.length > 0) {
      anomalies.push({
        id: `anomaly-${++this.anomalyCount}`,
        metric: 'Service Health',
        detectedAt: new Date(),
        severity: 95,
        description: `${downServices.length} service(s) are down`,
        affectedSystems: downServices.map(s => s.name),
        suggestedAction: 'Immediate investigation required'
      });
    }

    if (anomalies.length > 0) {
      console.log(`🚨 AnomalyAI: Detected ${anomalies.length} anomalies`);
      this.anomalies.update(current => [...(current || []), ...anomalies]);
    }
  }

  private detectMetricAnomaly(metric: MetricData) {
    const anomaly: AnomalyData = {
      id: `anomaly-${++this.anomalyCount}`,
      metric: 'Revenue Spike',
      detectedAt: new Date(),
      severity: 40,
      description: `Unusual revenue change detected: ${metric.changePercent > 0 ? '+' : ''}${metric.changePercent.toFixed(1)}%`,
      affectedSystems: ['Payment Processing', 'Order Management'],
      suggestedAction: 'Verify payment processing and check for data errors'
    };

    console.log('🚨 AnomalyAI: Unusual metric pattern detected');
    this.anomalies.update(current => [...(current || []), anomaly]);
  }
}

class SentimentAnalysisAgent {
  private name = 'SentimentAI';
  private sentiment = mapStore.registerProducer<SentimentData>('sentiment', this.name);
  
  constructor() {
    console.log('😊 SentimentAnalysis Agent: Initialized');
    this.analyzeSentiment();
    
    // Periodically update sentiment
    setInterval(() => this.analyzeSentiment(), 10000);
  }

  private analyzeSentiment() {
    // Simulate sentiment analysis from various sources
    const sentiments = ['positive', 'neutral', 'negative'] as const;
    const overall = sentiments[Math.floor(Math.random() * 3)];
    const score = overall === 'positive' ? 0.6 + Math.random() * 0.4 :
                  overall === 'negative' ? -0.8 + Math.random() * 0.4 :
                  -0.2 + Math.random() * 0.4;

    const data: SentimentData = {
      overall,
      score,
      breakdown: {
        positive: 45 + Math.random() * 20,
        neutral: 20 + Math.random() * 15,
        negative: 15 + Math.random() * 10
      },
      topTopics: [
        { topic: 'Product Quality', sentiment: 'positive', mentions: 234 },
        { topic: 'Customer Service', sentiment: 'positive', mentions: 189 },
        { topic: 'Pricing', sentiment: 'neutral', mentions: 156 },
        { topic: 'Shipping Speed', sentiment: 'negative', mentions: 89 },
        { topic: 'User Interface', sentiment: 'positive', mentions: 201 }
      ]
    };

    console.log(`😊 SentimentAI: Overall sentiment is ${overall} (${score.toFixed(2)})`);
    this.sentiment.publish(data);
  }
}

class RecommendationAgent {
  private name = 'RecommendationAI';
  private recommendations = mapStore.registerProducer<RecommendationData[]>('recommendations', this.name);
  private anomalyConsumer = mapStore.registerConsumer<AnomalyData[]>('anomalies', `${this.name}-anomaly`);
  private performanceConsumer = mapStore.registerConsumer<PerformanceData>('performance', `${this.name}-perf`);
  
  private recommendationId = 0;

  constructor() {
    console.log('💡 RecommendationAI Agent: Initialized');
    
    // Generate recommendations based on anomalies
    this.anomalyConsumer.subscribe(anomalies => {
      if (anomalies && anomalies.length > 0) {
        this.generateAnomalyRecommendations(anomalies);
      }
    });

    // Generate performance-based recommendations
    this.performanceConsumer.subscribe(perf => {
      if (perf) {
        this.generatePerformanceRecommendations(perf);
      }
    });

    // Generate some initial recommendations
    this.generateInitialRecommendations();
  }

  private generateAnomalyRecommendations(anomalies: AnomalyData[]) {
    const recommendations: RecommendationData[] = anomalies
      .filter(a => a.severity > 60)
      .map(anomaly => ({
        id: `rec-${++this.recommendationId}`,
        type: 'performance' as const,
        title: `Address ${anomaly.metric} Anomaly`,
        description: anomaly.suggestedAction || 'Investigate and resolve the detected anomaly',
        impact: anomaly.severity > 80 ? 'high' : 'medium' as const,
        implementation: [
          'Review system logs',
          'Check recent deployments',
          'Scale resources if needed',
          'Apply recommended fixes'
        ],
        aiConfidence: 0.85
      }));

    if (recommendations.length > 0) {
      console.log(`💡 RecommendationAI: Generated ${recommendations.length} anomaly-based recommendations`);
      this.recommendations.update(current => [...(current || []), ...recommendations]);
    }
  }

  private generatePerformanceRecommendations(perf: PerformanceData) {
    const recommendations: RecommendationData[] = [];

    if (perf.cpu > 70 && perf.cpu < 85) {
      recommendations.push({
        id: `rec-${++this.recommendationId}`,
        type: 'optimization',
        title: 'Optimize CPU Usage',
        description: 'CPU usage is elevated. Consider optimizing resource-intensive processes.',
        impact: 'medium',
        estimatedSavings: 2500,
        implementation: [
          'Profile application for bottlenecks',
          'Implement caching strategies',
          'Optimize database queries',
          'Consider horizontal scaling'
        ],
        aiConfidence: 0.78
      });
    }

    if (recommendations.length > 0) {
      this.recommendations.publish(recommendations);
    }
  }

  private generateInitialRecommendations() {
    const initialRecs: RecommendationData[] = [
      {
        id: `rec-${++this.recommendationId}`,
        type: 'cost',
        title: 'Reduce Cloud Infrastructure Costs',
        description: 'Analysis shows underutilized resources during off-peak hours',
        impact: 'high',
        estimatedSavings: 12000,
        implementation: [
          'Implement auto-scaling policies',
          'Use reserved instances for baseline load',
          'Schedule non-critical workloads during off-peak',
          'Review and remove unused resources'
        ],
        aiConfidence: 0.92
      },
      {
        id: `rec-${++this.recommendationId}`,
        type: 'security',
        title: 'Enhance API Security',
        description: 'Implement rate limiting and authentication improvements',
        impact: 'high',
        implementation: [
          'Add rate limiting to public endpoints',
          'Implement API key rotation',
          'Enable comprehensive logging',
          'Add request validation'
        ],
        aiConfidence: 0.88
      }
    ];

    setTimeout(() => {
      console.log('💡 RecommendationAI: Publishing initial recommendations');
      this.recommendations.publish(initialRecs);
    }, 1500);
  }
}

class DataAggregatorAgent {
  private name = 'DataAggregatorAI';
  private timeSeries = mapStore.registerProducer<TimeSeriesData>('timeseries-revenue', this.name);
  private categoryBreakdown = mapStore.registerProducer<CategoryBreakdown>('category-breakdown', this.name);
  private performance = mapStore.registerProducer<PerformanceData>('performance', this.name);

  constructor() {
    console.log('📊 DataAggregatorAI Agent: Initialized');
    this.startAggregation();
  }

  private startAggregation() {
    // Generate time series data
    this.generateTimeSeries();
    setInterval(() => this.generateTimeSeries(), 5000);

    // Generate category breakdowns
    this.generateCategoryBreakdown();
    setInterval(() => this.generateCategoryBreakdown(), 7000);

    // Generate performance data
    this.generatePerformanceData();
    setInterval(() => this.generatePerformanceData(), 3000);
  }

  private generateTimeSeries() {
    const now = new Date();
    const dataPoints = Array.from({ length: 24 }, (_, i) => ({
      time: new Date(now.getTime() - (23 - i) * 3600000),
      value: 10000 + Math.random() * 5000 + i * 200
    }));

    this.timeSeries.publish({
      label: 'Revenue (24h)',
      dataPoints,
      aggregation: 'sum'
    });
  }

  private generateCategoryBreakdown() {
    const categories = [
      { name: 'Electronics', value: 45000, color: '#3B82F6' },
      { name: 'Clothing', value: 32000, color: '#10B981' },
      { name: 'Home & Garden', value: 28000, color: '#F59E0B' },
      { name: 'Sports', value: 18000, color: '#EF4444' },
      { name: 'Books', value: 12000, color: '#8B5CF6' }
    ];

    // Add some randomness
    categories.forEach(cat => {
      cat.value = cat.value * (0.9 + Math.random() * 0.2);
    });

    const total = categories.reduce((sum, cat) => sum + cat.value, 0);
    
    this.categoryBreakdown.publish({
      categories: categories.map(cat => ({
        ...cat,
        percentage: (cat.value / total) * 100
      })),
      total
    });
  }

  private generatePerformanceData() {
    const services = [
      'API Gateway', 'Auth Service', 'Payment Service', 
      'Inventory Service', 'Notification Service'
    ];

    this.performance.publish({
      cpu: 30 + Math.random() * 60,
      memory: 40 + Math.random() * 50,
      disk: 20 + Math.random() * 40,
      network: {
        inbound: Math.random() * 100,
        outbound: Math.random() * 80
      },
      services: services.map(name => ({
        name,
        status: Math.random() > 0.9 ? 'degraded' : 
                Math.random() > 0.95 ? 'down' : 'healthy' as const,
        responseTime: 50 + Math.random() * 200
      }))
    });
  }
}

class AlertingAgent {
  private name = 'AlertingAI';
  private alerts = mapStore.registerProducer<AlertData[]>('alerts', this.name, []);
  private anomalyConsumer = mapStore.registerConsumer<AnomalyData[]>('anomalies', `${this.name}-anomaly`);
  private performanceConsumer = mapStore.registerConsumer<PerformanceData>('performance', `${this.name}-perf`);
  
  private alertId = 0;

  constructor() {
    console.log('🔔 AlertingAI Agent: Initialized');
    
    // Create alerts from anomalies
    this.anomalyConsumer.subscribe(anomalies => {
      if (anomalies) {
        this.createAnomalyAlerts(anomalies);
      }
    });

    // Monitor performance for critical alerts
    this.performanceConsumer.subscribe(perf => {
      if (perf) {
        this.checkPerformanceAlerts(perf);
      }
    });
  }

  private createAnomalyAlerts(anomalies: AnomalyData[]) {
    const newAlerts: AlertData[] = anomalies
      .filter(a => a.severity > 70)
      .map(anomaly => ({
        id: `alert-${++this.alertId}`,
        severity: anomaly.severity > 85 ? 'critical' : 'warning' as const,
        title: `Anomaly Detected: ${anomaly.metric}`,
        description: anomaly.description,
        source: 'Anomaly Detection System',
        timestamp: anomaly.detectedAt,
        actionRequired: anomaly.severity > 85
      }));

    if (newAlerts.length > 0) {
      console.log(`🔔 AlertingAI: Creating ${newAlerts.length} anomaly alerts`);
      this.alerts.update(current => [...(current || []), ...newAlerts]);
    }
  }

  private checkPerformanceAlerts(perf: PerformanceData) {
    const alerts: AlertData[] = [];

    if (perf.cpu > 90) {
      alerts.push({
        id: `alert-${++this.alertId}`,
        severity: 'critical',
        title: 'Critical CPU Usage',
        description: `CPU usage is at ${perf.cpu.toFixed(1)}%. Immediate action required.`,
        source: 'Performance Monitor',
        timestamp: new Date(),
        actionRequired: true
      });
    }

    const criticalServices = perf.services.filter(s => s.status === 'down');
    if (criticalServices.length > 0) {
      alerts.push({
        id: `alert-${++this.alertId}`,
        severity: 'critical',
        title: 'Service Outage',
        description: `${criticalServices.length} service(s) are down: ${criticalServices.map(s => s.name).join(', ')}`,
        source: 'Service Monitor',
        timestamp: new Date(),
        actionRequired: true
      });
    }

    if (alerts.length > 0) {
      this.alerts.update(current => [...(current || []), ...alerts]);
    }
  }
}

// ============================================
// DASHBOARD WIDGETS (Consumers)
// ============================================

class MetricWidget {
  private id: string;
  private label: string;
  private consumer: ReturnType<typeof mapStore.registerConsumer<MetricData>>;

  constructor(id: string, label: string, metricType: string) {
    this.id = id;
    this.label = label;
    this.consumer = mapStore.registerConsumer<MetricData>(metricType, `widget-${id}`);
    
    console.log(`📈 MetricWidget[${label}]: Initialized`);
    
    this.consumer.subscribe(data => {
      if (data) {
        this.render(data);
      }
    });
  }

  private render(data: MetricData) {
    const trendIcon = data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→';
    const trendColor = data.trend === 'up' ? '🟢' : data.trend === 'down' ? '🔴' : '🟡';
    
    console.log(
      `📈 ${this.label}: ${data.value.toFixed(0)} ${data.unit} ` +
      `${trendColor} ${trendIcon} ${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(1)}%`
    );
  }
}

class ChartWidget {
  private id: string;
  private consumer: ReturnType<typeof mapStore.registerConsumer<TimeSeriesData>>;

  constructor(id: string, dataType: string) {
    this.id = id;
    this.consumer = mapStore.registerConsumer<TimeSeriesData>(dataType, `widget-${id}`);
    
    console.log(`📊 ChartWidget[${id}]: Initialized`);
    
    this.consumer.subscribe(data => {
      if (data) {
        this.render(data);
      }
    });
  }

  private render(data: TimeSeriesData) {
    const latest = data.dataPoints[data.dataPoints.length - 1];
    const first = data.dataPoints[0];
    const change = ((latest.value - first.value) / first.value) * 100;
    
    console.log(
      `📊 Chart: ${data.label} - Latest: $${latest.value.toFixed(0)} ` +
      `(${change > 0 ? '+' : ''}${change.toFixed(1)}% over period)`
    );
  }
}

class PieChartWidget {
  private id: string;
  private consumer: ReturnType<typeof mapStore.registerConsumer<CategoryBreakdown>>;

  constructor(id: string) {
    this.id = id;
    this.consumer = mapStore.registerConsumer<CategoryBreakdown>('category-breakdown', `widget-${id}`);
    
    console.log(`🥧 PieChartWidget[${id}]: Initialized`);
    
    this.consumer.subscribe(data => {
      if (data) {
        this.render(data);
      }
    });
  }

  private render(data: CategoryBreakdown) {
    console.log(`🥧 Category Breakdown - Total: $${data.total.toFixed(0)}`);
    data.categories
      .sort((a, b) => b.value - a.value)
      .forEach(cat => {
        const bar = '█'.repeat(Math.floor(cat.percentage / 5));
        console.log(`   ${cat.name}: ${bar} ${cat.percentage.toFixed(1)}% ($${cat.value.toFixed(0)})`);
      });
  }
}

class AlertsWidget {
  private consumer: ReturnType<typeof mapStore.registerConsumer<AlertData[]>>;
  private lastAlertCount = 0;

  constructor() {
    this.consumer = mapStore.registerConsumer<AlertData[]>('alerts', 'widget-alerts');
    
    console.log('🚨 AlertsWidget: Initialized');
    
    this.consumer.subscribe(alerts => {
      if (alerts && alerts.length > this.lastAlertCount) {
        this.renderNewAlerts(alerts.slice(this.lastAlertCount));
        this.lastAlertCount = alerts.length;
      }
    });
  }

  private renderNewAlerts(newAlerts: AlertData[]) {
    newAlerts.forEach(alert => {
      const icon = alert.severity === 'critical' ? '🔴' :
                   alert.severity === 'warning' ? '🟡' : 'ℹ️';
      
      console.log(
        `🚨 ALERT ${icon} [${alert.severity.toUpperCase()}]: ${alert.title}\n` +
        `   ${alert.description}\n` +
        `   Source: ${alert.source} | Action Required: ${alert.actionRequired ? 'YES' : 'No'}`
      );
    });
  }
}

class PredictionsWidget {
  private consumer: ReturnType<typeof mapStore.registerConsumer<PredictionData[]>>;

  constructor() {
    this.consumer = mapStore.registerConsumer<PredictionData[]>('predictions', 'widget-predictions');
    
    console.log('🔮 PredictionsWidget: Initialized');
    
    this.consumer.subscribe(predictions => {
      if (predictions) {
        this.render(predictions);
      }
    });
  }

  private render(predictions: PredictionData[]) {
    console.log('🔮 AI Predictions:');
    predictions.forEach(pred => {
      const change = ((pred.predictedValue - pred.currentValue) / pred.currentValue) * 100;
      const confidence = `${'█'.repeat(Math.floor(pred.confidence * 10))}${'░'.repeat(10 - Math.floor(pred.confidence * 10))}`;
      
      console.log(
        `   ${pred.metric} (${pred.timeHorizon}):\n` +
        `   Current: ${pred.currentValue.toFixed(0)} → Predicted: ${pred.predictedValue.toFixed(0)} ` +
        `(${change > 0 ? '+' : ''}${change.toFixed(1)}%)\n` +
        `   Confidence: ${confidence} ${(pred.confidence * 100).toFixed(0)}%\n` +
        `   Factors: ${pred.factors.join(', ')}`
      );
    });
  }
}

class SentimentWidget {
  private consumer: ReturnType<typeof mapStore.registerConsumer<SentimentData>>;

  constructor() {
    this.consumer = mapStore.registerConsumer<SentimentData>('sentiment', 'widget-sentiment');
    
    console.log('😊 SentimentWidget: Initialized');
    
    this.consumer.subscribe(data => {
      if (data) {
        this.render(data);
      }
    });
  }

  private render(data: SentimentData) {
    const emoji = data.overall === 'positive' ? '😊' :
                  data.overall === 'negative' ? '😔' : '😐';
    
    console.log(
      `😊 Customer Sentiment: ${emoji} ${data.overall.toUpperCase()} (Score: ${data.score.toFixed(2)})\n` +
      `   Breakdown: Positive ${data.breakdown.positive.toFixed(0)}% | ` +
      `Neutral ${data.breakdown.neutral.toFixed(0)}% | ` +
      `Negative ${data.breakdown.negative.toFixed(0)}%`
    );
    
    console.log('   Top Topics:');
    data.topTopics.forEach(topic => {
      const sentiment = topic.sentiment === 'positive' ? '👍' :
                       topic.sentiment === 'negative' ? '👎' : '👊';
      console.log(`   - ${topic.topic}: ${sentiment} (${topic.mentions} mentions)`);
    });
  }
}

class RecommendationsWidget {
  private consumer: ReturnType<typeof mapStore.registerConsumer<RecommendationData[]>>;
  private displayedRecs = new Set<string>();

  constructor() {
    this.consumer = mapStore.registerConsumer<RecommendationData[]>('recommendations', 'widget-recommendations');
    
    console.log('💡 RecommendationsWidget: Initialized');
    
    this.consumer.subscribe(recs => {
      if (recs) {
        this.render(recs);
      }
    });
  }

  private render(recommendations: RecommendationData[]) {
    const newRecs = recommendations.filter(r => !this.displayedRecs.has(r.id));
    
    if (newRecs.length > 0) {
      console.log('💡 New AI Recommendations:');
      newRecs.forEach(rec => {
        const impactIcon = rec.impact === 'high' ? '🔴' :
                          rec.impact === 'medium' ? '🟡' : '🟢';
        
        console.log(
          `   ${impactIcon} [${rec.type.toUpperCase()}] ${rec.title}\n` +
          `   ${rec.description}\n` +
          `   Impact: ${rec.impact} | ` +
          `${rec.estimatedSavings ? `Savings: $${rec.estimatedSavings}/month | ` : ''}` +
          `AI Confidence: ${(rec.aiConfidence * 100).toFixed(0)}%`
        );
        
        this.displayedRecs.add(rec.id);
      });
    }
  }
}

class PerformanceWidget {
  private consumer: ReturnType<typeof mapStore.registerConsumer<PerformanceData>>;

  constructor() {
    this.consumer = mapStore.registerConsumer<PerformanceData>('performance', 'widget-performance');
    
    console.log('⚡ PerformanceWidget: Initialized');
    
    this.consumer.subscribe(data => {
      if (data) {
        this.render(data);
      }
    });
  }

  private render(data: PerformanceData) {
    const cpuBar = this.getBar(data.cpu);
    const memBar = this.getBar(data.memory);
    const diskBar = this.getBar(data.disk);
    
    console.log(
      `⚡ System Performance:\n` +
      `   CPU:    ${cpuBar} ${data.cpu.toFixed(1)}%\n` +
      `   Memory: ${memBar} ${data.memory.toFixed(1)}%\n` +
      `   Disk:   ${diskBar} ${data.disk.toFixed(1)}%\n` +
      `   Network: ↓${data.network.inbound.toFixed(1)} Mbps ↑${data.network.outbound.toFixed(1)} Mbps`
    );
    
    const unhealthyServices = data.services.filter(s => s.status !== 'healthy');
    if (unhealthyServices.length > 0) {
      console.log('   ⚠️ Service Issues:');
      unhealthyServices.forEach(s => {
        const icon = s.status === 'down' ? '🔴' : '🟡';
        console.log(`   ${icon} ${s.name}: ${s.status}`);
      });
    }
  }

  private getBar(percentage: number): string {
    const filled = Math.floor(percentage / 10);
    const color = percentage > 80 ? '🔴' : percentage > 60 ? '🟡' : '🟢';
    return color + '█'.repeat(filled) + '░'.repeat(10 - filled);
  }
}

// ============================================
// COMPOSITE WIDGETS (Multiple Consumers)
// ============================================

class ExecutiveDashboard {
  private metricsConsumers: Map<string, ReturnType<typeof mapStore.registerConsumer<MetricData>>>;
  private alertsConsumer: ReturnType<typeof mapStore.registerConsumer<AlertData[]>>;
  private sentimentConsumer: ReturnType<typeof mapStore.registerConsumer<SentimentData>>;
  private predictionsConsumer: ReturnType<typeof mapStore.registerConsumer<PredictionData[]>>;

  constructor() {
    console.log('👔 ExecutiveDashboard: Initializing composite view');
    
    // Subscribe to multiple data types
    this.metricsConsumers = new Map([
      ['revenue', mapStore.registerConsumer<MetricData>('revenue-metric', 'exec-revenue')],
      ['sales', mapStore.registerConsumer<MetricData>('sales-metric', 'exec-sales')],
      ['users', mapStore.registerConsumer<MetricData>('users-metric', 'exec-users')]
    ]);
    
    this.alertsConsumer = mapStore.registerConsumer<AlertData[]>('alerts', 'exec-alerts');
    this.sentimentConsumer = mapStore.registerConsumer<SentimentData>('sentiment', 'exec-sentiment');
    this.predictionsConsumer = mapStore.registerConsumer<PredictionData[]>('predictions', 'exec-predictions');
    
    // Update dashboard when any data changes
    this.setupSubscriptions();
  }

  private setupSubscriptions() {
    let dashboardData: Record<string, any> = {};
    
    // Aggregate all metrics
    this.metricsConsumers.forEach((consumer, key) => {
      consumer.subscribe(data => {
        if (data) {
          dashboardData[key] = data;
          this.updateDashboard(dashboardData);
        }
      });
    });
    
    // Monitor critical alerts
    this.alertsConsumer.subscribe(alerts => {
      const criticalAlerts = alerts?.filter(a => a.severity === 'critical') || [];
      if (criticalAlerts.length > 0) {
        console.log(`👔 EXECUTIVE ALERT: ${criticalAlerts.length} critical issues require attention!`);
      }
    });
  }

  private updateDashboard(data: Record<string, any>) {
    if (Object.keys(data).length === 3) { // All metrics loaded
      console.log('👔 Executive Dashboard Update:');
      console.log('   Key Metrics Summary:');
      Object.entries(data).forEach(([key, metric]: [string, any]) => {
        const icon = metric.trend === 'up' ? '📈' : '📉';
        console.log(`   ${icon} ${key}: ${metric.value.toFixed(0)} (${metric.changePercent > 0 ? '+' : ''}${metric.changePercent.toFixed(1)}%)`);
      });
    }
  }
}

// ============================================
// INTERACTIVE CHAT INTERFACE
// ============================================

class ChatInterface {
  private chatProducer = mapStore.register<ChatMessage[]>('chat', 'chatInterface', []);
  private anomalyConsumer = mapStore.registerConsumer<AnomalyData[]>('anomalies', 'chat-anomaly');
  private recommendationsConsumer = mapStore.registerConsumer<RecommendationData[]>('recommendations', 'chat-rec');

  constructor() {
    console.log('💬 ChatInterface: AI Assistant ready');
    
    // AI can respond to data changes
    this.anomalyConsumer.subscribe(anomalies => {
      if (anomalies && anomalies.length > 0) {
        const latest = anomalies[anomalies.length - 1];
        if (latest.severity > 80) {
          this.addAssistantMessage(
            `⚠️ I've detected a critical anomaly in ${latest.metric}. ` +
            `${latest.description}. ${latest.suggestedAction || 'Please investigate immediately.'}`
          );
        }
      }
    });
  }

  simulateUserQuery(query: string) {
    this.addUserMessage(query);
    
    // Simulate AI processing and response
    setTimeout(() => {
      if (query.toLowerCase().includes('recommendation')) {
        const recs = this.recommendationsConsumer.get();
        if (recs && recs.length > 0) {
          this.addAssistantMessage(
            `Based on my analysis, here are the top recommendations:\n` +
            recs.slice(0, 3).map(r => `• ${r.title}: ${r.description}`).join('\n')
          );
        }
      } else if (query.toLowerCase().includes('anomaly') || query.toLowerCase().includes('issue')) {
        const anomalies = this.anomalyConsumer.get();
        if (anomalies && anomalies.length > 0) {
          this.addAssistantMessage(
            `I've detected ${anomalies.length} anomalies in the system. ` +
            `The most critical one is in ${anomalies[0].metric}. Would you like me to provide more details?`
          );
        }
      } else {
        this.addAssistantMessage(
          `I'm monitoring all system metrics and will alert you to any issues. ` +
          `You can ask me about recommendations, anomalies, or system performance.`
        );
      }
    }, 1000);
  }

  private addUserMessage(content: string) {
    console.log(`💬 User: ${content}`);
    this.chatProducer.update(messages => [
      ...(messages || []),
      { role: 'user', content, timestamp: new Date() }
    ]);
  }

  private addAssistantMessage(content: string) {
    console.log(`💬 AI Assistant: ${content}`);
    this.chatProducer.update(messages => [
      ...(messages || []),
      { role: 'assistant', content, timestamp: new Date() }
    ]);
  }
}

// ============================================
// MAIN APPLICATION
// ============================================

async function runDashboard() {
  console.log('🚀 Starting AI-Powered Dashboard System\n');
  console.log('=' .repeat(60));
  
  // Initialize AI Agents (Producers)
  console.log('\n📡 Initializing AI Agents...\n');
  const metricsAgent = new MetricsAIAgent();
  const aggregatorAgent = new DataAggregatorAgent();
  const predictiveAgent = new PredictiveAIAgent();
  const anomalyAgent = new AnomalyDetectionAgent();
  const sentimentAgent = new SentimentAnalysisAgent();
  const recommendationAgent = new RecommendationAgent();
  const alertingAgent = new AlertingAgent();
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Initialize Dashboard Widgets (Consumers)
  console.log('\n📊 Initializing Dashboard Widgets...\n');
  const revenueWidget = new MetricWidget('revenue-widget', 'Revenue', 'revenue-metric');
  const salesWidget = new MetricWidget('sales-widget', 'Sales', 'sales-metric');
  const usersWidget = new MetricWidget('users-widget', 'Active Users', 'users-metric');
  
  const chartWidget = new ChartWidget('time-chart', 'timeseries-revenue');
  const pieWidget = new PieChartWidget('pie-chart');
  const alertsWidget = new AlertsWidget();
  const predictionsWidget = new PredictionsWidget();
  const sentimentWidget = new SentimentWidget();
  const recommendationsWidget = new RecommendationsWidget();
  const performanceWidget = new PerformanceWidget();
  
  // Initialize composite dashboard
  const executiveDashboard = new ExecutiveDashboard();
  
  // Initialize chat interface
  const chatInterface = new ChatInterface();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 Dashboard Running - Real-time Updates Below:\n');
  
  // Simulate user interactions after a delay
  setTimeout(() => {
    console.log('\n' + '─' .repeat(60));
    console.log('💬 Simulating User Interaction:\n');
    chatInterface.simulateUserQuery('What recommendations do you have for improving performance?');
  }, 8000);
  
  setTimeout(() => {
    console.log('\n' + '─' .repeat(60));
    console.log('📊 System Status Overview:\n');
    const typeInfo = mapStore.getTypeInfo();
    
    console.log('Data Flow Connections:');
    typeInfo.forEach(info => {
      console.log(
        `   ${info.typeId}: ${info.producerCount} AI agents → ${info.consumerCount} widgets`
      );
    });
    
    console.log('\n🎭 Active AI Agents:');
    console.log('   • MetricsAI - Generating real-time metrics');
    console.log('   • DataAggregatorAI - Processing time series & categories');
    console.log('   • PredictiveAI - Forecasting future trends');
    console.log('   • AnomalyAI - Detecting unusual patterns');
    console.log('   • SentimentAI - Analyzing customer feedback');
    console.log('   • RecommendationAI - Providing actionable insights');
    console.log('   • AlertingAI - Managing system alerts');
    
    console.log('\n📱 Active Widgets:');
    console.log('   • 3 Metric Widgets - Revenue, Sales, Users');
    console.log('   • Time Series Chart - Revenue trends');
    console.log('   • Category Pie Chart - Sales breakdown');
    console.log('   • Alerts Feed - Critical notifications');
    console.log('   • AI Predictions - Future forecasts');
    console.log('   • Sentiment Monitor - Customer mood');
    console.log('   • Recommendations Panel - AI insights');
    console.log('   • Performance Monitor - System health');
    console.log('   • Executive Dashboard - Aggregated view');
    console.log('   • Chat Interface - Interactive AI assistant');
  }, 12000);
  
  // Keep the dashboard running
  console.log('\n💡 Dashboard will continue updating in real-time...');
  console.log('   (In a real application, this would run indefinitely)\n');
}

// Run the dashboard
runDashboard().catch(console.error);