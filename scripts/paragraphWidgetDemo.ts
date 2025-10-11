// simple-paragraph-widget.ts
// A simple example of a ParagraphWidget consuming data from an AI Agent

import { mapStore } from '../src/lib/stores/mapObjectStore';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface BaseWidget {
  id: string;
  position?: { x: number; y: number };
}

interface ParagraphWidget extends BaseWidget {
  type: 'paragraph';
  data: {
    title?: string;
    content: string;
    markdown?: boolean;
  };
}

// ============================================
// AI AGENT (Producer)
// ============================================

class ContentGeneratorAgent {
  private contentProducer = mapStore.registerProducer<ParagraphWidget['data']>(
    'paragraph-content',
    'content-generator-agent'
  );

  constructor() {
    console.log('🤖 ContentGenerator Agent: Initialized');
    console.log('   Generating initial content...\n');
    
    // Generate initial content
    this.generateContent();
    
    // Simulate periodic content updates
    setInterval(() => {
      this.generateContent();
    }, 5000);
  }

  private generateContent() {
    const topics = [
      {
        title: 'AI Dashboard Update',
        content: 'The AI-powered dashboard is now processing **12,543 events per second** with an average latency of _15ms_. Machine learning models have achieved a 94% accuracy rate in predicting user behavior patterns.',
        markdown: true
      },
      {
        title: 'System Performance',
        content: 'All systems are operating normally. CPU usage: 45%, Memory: 62%, Network throughput: optimal. No anomalies detected in the last hour.',
        markdown: false
      },
      {
        title: 'Market Analysis',
        content: 'Today\'s market shows **strong growth** in the technology sector with a _3.2% increase_. AI and machine learning companies are leading the surge with unprecedented investor interest.',
        markdown: true
      },
      {
        title: 'Weather Report',
        content: 'Current conditions: Partly cloudy, 72°F. Forecast: Mild temperatures continuing through the week with a 20% chance of rain on Thursday.',
        markdown: false
      },
      {
        title: 'Breaking News',
        content: '**Breaking:** Scientists announce breakthrough in quantum computing, achieving stable qubit coherence for over _100 microseconds_. This represents a ***10x improvement*** over previous records.',
        markdown: true
      }
    ];

    // Pick a random topic
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    // Add timestamp to content
    const timestamp = new Date().toLocaleTimeString();
    const contentWithTime = `${topic.content}\n\n_Last updated: ${timestamp}_`;

    const data: ParagraphWidget['data'] = {
      title: topic.title,
      content: topic.markdown ? contentWithTime : `${topic.content}\n\nLast updated: ${timestamp}`,
      markdown: topic.markdown
    };

    console.log(`🤖 AI Agent generated new content: "${topic.title}"`);
    this.contentProducer.publish(data);
  }

  // Method to generate content on demand
  generateCustomContent(prompt: string) {
    console.log(`🤖 AI Agent received prompt: "${prompt}"`);
    
    // Simulate AI generating content based on prompt
    const data: ParagraphWidget['data'] = {
      title: `Response to: ${prompt}`,
      content: `Based on your request about "${prompt}", here's what I found: The analysis indicates strong patterns in the data with multiple correlation points. Further investigation reveals interesting trends that suggest optimal outcomes are achievable through strategic implementation.\n\n_Generated at: ${new Date().toLocaleTimeString()}_`,
      markdown: true
    };

    this.contentProducer.publish(data);
  }
}

// ============================================
// PARAGRAPH WIDGET (Consumer)
// ============================================

class ParagraphWidgetComponent implements ParagraphWidget {
  id: string;
  type: 'paragraph' = 'paragraph';
  position: { x: number; y: number };
  data: ParagraphWidget['data'];
  
  private consumer = mapStore.registerConsumer<ParagraphWidget['data']>(
    'paragraph-content',
    'paragraph-widget'
  );

  constructor(id: string, position = { x: 0, y: 0 }) {
    this.id = id;
    this.position = position;
    this.data = {
      content: 'Waiting for content...',
      markdown: false
    };

    console.log(`📝 ParagraphWidget[${id}]: Initialized at position (${position.x}, ${position.y})`);
    console.log('   Subscribing to content updates...\n');
    
    // Subscribe to content updates
    this.consumer.subscribe(data => {
      if (data) {
        this.updateContent(data);
      }
    });
  }

  private updateContent(data: ParagraphWidget['data']) {
    this.data = data;
    this.render();
  }

  private render() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    
    if (this.data.title) {
      console.log(`║ ${this.data.title.padEnd(58)} ║`);
      console.log('╟────────────────────────────────────────────────────────────╢');
    }
    
    // Simulate markdown rendering
    let displayContent = this.data.content;
    if (this.data.markdown) {
      // Simple markdown simulation (in real app, use a markdown parser)
      displayContent = displayContent
        .replace(/\*\*\*(.*?)\*\*\*/g, '⚡$1⚡')  // Bold + italic
        .replace(/\*\*(.*?)\*\*/g, '▶$1◀')       // Bold
        .replace(/_(.*?)_/g, '「$1」');           // Italic
    }
    
    // Word wrap for console display
    const words = displayContent.split(' ');
    let line = '║ ';
    let lineLength = 2;
    
    for (const word of words) {
      if (lineLength + word.length > 58) {
        console.log(line.padEnd(62) + '║');
        line = '║ ';
        lineLength = 2;
      }
      line += word + ' ';
      lineLength += word.length + 1;
    }
    
    if (lineLength > 2) {
      console.log(line.padEnd(62) + '║');
    }
    
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    if (this.data.markdown) {
      console.log('   📌 Markdown enabled\n');
    } else {
      console.log('   📄 Plain text\n');
    }
  }

  // Method to get current content
  getContent(): ParagraphWidget['data'] {
    return this.data;
  }

  // Method to check if widget has content
  hasContent(): boolean {
    return this.data.content !== 'Waiting for content...';
  }
}

// ============================================
// MAIN APPLICATION
// ============================================

async function runSimpleApp() {
  console.log('🚀 Starting Simple ParagraphWidget Demo\n');
  console.log('=' .repeat(64));
  console.log('\n');

  // Create the AI agent that generates content
  const contentAgent = new ContentGeneratorAgent();

  // Small delay to let initial content generate
  await new Promise(resolve => setTimeout(resolve, 100));

  // Create paragraph widgets at different positions
  const widget1 = new ParagraphWidgetComponent('widget-1', { x: 0, y: 0 });
  const widget2 = new ParagraphWidgetComponent('widget-2', { x: 100, y: 0 });

  console.log('=' .repeat(64));
  console.log('ℹ️  Multiple widgets are now subscribed to the same AI agent');
  console.log('   Both widgets will update when the AI generates new content');
  console.log('=' .repeat(64));
  console.log('\n');

  // Simulate user requesting specific content after 3 seconds
  setTimeout(() => {
    console.log('👤 User Request: Generate content about "machine learning trends"\n');
    contentAgent.generateCustomContent('machine learning trends');
  }, 3000);

  // Show system info after 8 seconds
  setTimeout(() => {
    console.log('=' .repeat(64));
    console.log('📊 System Status:');
    
    const typeInfo = mapStore.getTypeInfo();
    typeInfo.forEach(info => {
      console.log(`   Data type "${info.typeId}":`);
      console.log(`   - ${info.producerCount} AI agent(s) producing content`);
      console.log(`   - ${info.consumerCount} widget(s) consuming content`);
      console.log(`   - Has data: ${info.hasValue ? 'Yes ✓' : 'No'}`);
    });

    console.log('\n   Widget States:');
    console.log(`   - Widget 1: ${widget1.hasContent() ? 'Displaying content ✓' : 'Waiting...'}`);
    console.log(`   - Widget 2: ${widget2.hasContent() ? 'Displaying content ✓' : 'Waiting...'}`);
    
    console.log('\n💡 The AI agent will continue generating new content every 5 seconds');
    console.log('   All connected widgets update automatically!\n');
    console.log('=' .repeat(64));
  }, 8000);

  console.log('📡 Demo is running... (New content every 5 seconds)\n');
}

// Run the application
runSimpleApp().catch(console.error);