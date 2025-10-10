// ============================================
// Data Types and Interfaces
// ============================================

interface UserData {
	type: 'user';
	id: string;
	name: string;
	email: string;
	createdAt: Date;
}

interface OrderData {
	type: 'order';
	orderId: string;
	userId: string;
	amount: number;
	items: string[];
	status: 'pending' | 'completed' | 'cancelled';
}

interface InventoryData {
	type: 'inventory';
	productId: string;
	quantity: number;
	lastUpdated: Date;
}

interface NotificationData {
	type: 'notification';
	recipientId: string;
	message: string;
	priority: 'low' | 'medium' | 'high';
	timestamp: Date;
}

// Type map for strong typing
interface DataTypeMap {
	user: UserData;
	order: OrderData;
	inventory: InventoryData;
	notification: NotificationData;
}

// ============================================
// Base Classes
// ============================================

abstract class TypedProducer<K extends keyof DataTypeMap> {
	abstract readonly dataType: K;
	abstract readonly name: string;
	abstract produce(): DataTypeMap[K];

	// Optional: Add metadata about the producer
	getInfo(): string {
		return `Producer: ${this.name} (produces ${this.dataType})`;
	}
}

abstract class TypedConsumer<K extends keyof DataTypeMap> {
	abstract readonly requiredType: K;
	abstract readonly name: string;
	abstract consume(data: DataTypeMap[K]): void;

	// Optional: Add metadata about the consumer
	getInfo(): string {
		return `Consumer: ${this.name} (consumes ${this.requiredType})`;
	}
}

// ============================================
// Mediator Implementation
// ============================================

class DataMediator {
	private producers = new Map<keyof DataTypeMap, TypedProducer<any>[]>();
	private consumers = new Map<keyof DataTypeMap, TypedConsumer<any>[]>();
	private producerConsumerMap = new Map<string, string[]>();

	// Logging for debugging
	private log(message: string): void {
		console.log(`[Mediator] ${message}`);
	}

	registerProducer<K extends keyof DataTypeMap>(producer: TypedProducer<K>): void {
		const existing = this.producers.get(producer.dataType) || [];
		this.producers.set(producer.dataType, [...existing, producer]);
		this.log(`Registered producer: ${producer.name} for type: ${producer.dataType}`);
	}

	registerConsumer<K extends keyof DataTypeMap>(consumer: TypedConsumer<K>): void {
		const existing = this.consumers.get(consumer.requiredType) || [];
		this.consumers.set(consumer.requiredType, [...existing, consumer]);
		this.log(`Registered consumer: ${consumer.name} for type: ${consumer.requiredType}`);
	}

	connectConsumer<K extends keyof DataTypeMap>(consumer: TypedConsumer<K>): TypedProducer<K>[] {
		const compatibleProducers = this.producers.get(consumer.requiredType) || [];

		// Track connections for monitoring
		const producerNames = compatibleProducers.map((p) => p.name);
		this.producerConsumerMap.set(consumer.name, producerNames);

		this.log(`Connected ${consumer.name} with ${compatibleProducers.length} producers`);
		return compatibleProducers as TypedProducer<K>[];
	}

	// Execute data flow from all compatible producers to a consumer
	executeDataFlow<K extends keyof DataTypeMap>(consumer: TypedConsumer<K>): void {
		const producers = this.connectConsumer(consumer);

		this.log(`Executing data flow for ${consumer.name}`);
		producers.forEach((producer) => {
			const data = producer.produce();
			this.log(`  ${producer.name} -> ${consumer.name}`);
			consumer.consume(data);
		});
	}

	// Execute data flow for all registered consumers
	executeAllDataFlows(): void {
		this.log('Executing all data flows...');
		this.consumers.forEach((consumersArray) => {
			consumersArray.forEach((consumer) => {
				this.executeDataFlow(consumer);
			});
		});
	}

	// Get statistics about the mediator
	getStatistics(): {
		producerCount: number;
		consumerCount: number;
		connections: Map<string, string[]>;
	} {
		let producerCount = 0;
		let consumerCount = 0;

		this.producers.forEach((producers) => {
			producerCount += producers.length;
		});

		this.consumers.forEach((consumers) => {
			consumerCount += consumers.length;
		});

		return {
			producerCount,
			consumerCount,
			connections: this.producerConsumerMap
		};
	}

	// Find all consumers for a specific data type
	findConsumersForType<K extends keyof DataTypeMap>(dataType: K): TypedConsumer<K>[] {
		return (this.consumers.get(dataType) || []) as TypedConsumer<K>[];
	}

	// Find all producers for a specific data type
	findProducersForType<K extends keyof DataTypeMap>(dataType: K): TypedProducer<K>[] {
		return (this.producers.get(dataType) || []) as TypedProducer<K>[];
	}
}

// ============================================
// Concrete Producers
// ============================================

class DatabaseUserProducer extends TypedProducer<'user'> {
	readonly dataType = 'user';
	readonly name = 'DatabaseUserProducer';

	produce(): UserData {
		// Simulate database fetch
		return {
			type: 'user',
			id: `user_${Math.floor(Math.random() * 1000)}`,
			name: 'John Doe',
			email: 'john@example.com',
			createdAt: new Date()
		};
	}
}

class APIUserProducer extends TypedProducer<'user'> {
	readonly dataType = 'user';
	readonly name = 'APIUserProducer';

	produce(): UserData {
		// Simulate API call
		return {
			type: 'user',
			id: `api_user_${Math.floor(Math.random() * 1000)}`,
			name: 'Jane Smith',
			email: 'jane@example.com',
			createdAt: new Date()
		};
	}
}

class OrderProducer extends TypedProducer<'order'> {
	readonly dataType = 'order';
	readonly name = 'OrderProducer';

	produce(): OrderData {
		return {
			type: 'order',
			orderId: `order_${Math.floor(Math.random() * 10000)}`,
			userId: 'user_123',
			amount: Math.random() * 1000,
			items: ['item1', 'item2', 'item3'],
			status: 'pending'
		};
	}
}

class InventoryProducer extends TypedProducer<'inventory'> {
	readonly dataType = 'inventory';
	readonly name = 'InventoryProducer';

	produce(): InventoryData {
		return {
			type: 'inventory',
			productId: `prod_${Math.floor(Math.random() * 100)}`,
			quantity: Math.floor(Math.random() * 1000),
			lastUpdated: new Date()
		};
	}
}

class NotificationProducer extends TypedProducer<'notification'> {
	readonly dataType = 'notification';
	readonly name = 'NotificationProducer';

	produce(): NotificationData {
		const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
		return {
			type: 'notification',
			recipientId: `user_${Math.floor(Math.random() * 100)}`,
			message: 'You have a new message!',
			priority: priorities[Math.floor(Math.random() * priorities.length)],
			timestamp: new Date()
		};
	}
}

// ============================================
// Concrete Consumers
// ============================================

class UserAnalyticsConsumer extends TypedConsumer<'user'> {
	readonly requiredType = 'user';
	readonly name = 'UserAnalyticsConsumer';

	private userCount = 0;

	consume(data: UserData): void {
		this.userCount++;
		console.log(`[Analytics] Processing user: ${data.name} (${data.id})`);
		console.log(`  Total users processed: ${this.userCount}`);
	}
}

class UserNotificationConsumer extends TypedConsumer<'user'> {
	readonly requiredType = 'user';
	readonly name = 'UserNotificationConsumer';

	consume(data: UserData): void {
		console.log(`[Notification] Sending welcome email to: ${data.email}`);
	}
}

class OrderProcessingConsumer extends TypedConsumer<'order'> {
	readonly requiredType = 'order';
	readonly name = 'OrderProcessingConsumer';

	consume(data: OrderData): void {
		console.log(`[Order Processing] Processing order ${data.orderId}`);
		console.log(`  Amount: $${data.amount.toFixed(2)}`);
		console.log(`  Items: ${data.items.join(', ')}`);
	}
}

class InventoryAlertConsumer extends TypedConsumer<'inventory'> {
	readonly requiredType = 'inventory';
	readonly name = 'InventoryAlertConsumer';

	consume(data: InventoryData): void {
		if (data.quantity < 100) {
			console.log(`[Inventory Alert] Low stock warning for product ${data.productId}!`);
			console.log(`  Current quantity: ${data.quantity}`);
		} else {
			console.log(`[Inventory] Stock level OK for ${data.productId}: ${data.quantity}`);
		}
	}
}

class NotificationDispatcherConsumer extends TypedConsumer<'notification'> {
	readonly requiredType = 'notification';
	readonly name = 'NotificationDispatcherConsumer';

	consume(data: NotificationData): void {
		const icon = data.priority === 'high' ? '🔴' : data.priority === 'medium' ? '🟡' : '🟢';
		console.log(`[Dispatcher] ${icon} Sending ${data.priority} priority notification`);
		console.log(`  To: ${data.recipientId}`);
		console.log(`  Message: "${data.message}"`);
	}
}

// ============================================
// Main Program
// ============================================

function main() {
	console.log('='.repeat(50));
	console.log('Type-Safe Mediator Pattern Demo');
	console.log('='.repeat(50));

	// Create mediator
	const mediator = new DataMediator();

	// Create and register producers
	const dbUserProducer = new DatabaseUserProducer();
	const apiUserProducer = new APIUserProducer();
	const orderProducer = new OrderProducer();
	const inventoryProducer = new InventoryProducer();
	const notificationProducer = new NotificationProducer();

	mediator.registerProducer(dbUserProducer);
	mediator.registerProducer(apiUserProducer);
	mediator.registerProducer(orderProducer);
	mediator.registerProducer(inventoryProducer);
	mediator.registerProducer(notificationProducer);

	// Create and register consumers
	const userAnalytics = new UserAnalyticsConsumer();
	const userNotification = new UserNotificationConsumer();
	const orderProcessing = new OrderProcessingConsumer();
	const inventoryAlert = new InventoryAlertConsumer();
	const notificationDispatcher = new NotificationDispatcherConsumer();

	mediator.registerConsumer(userAnalytics);
	mediator.registerConsumer(userNotification);
	mediator.registerConsumer(orderProcessing);
	mediator.registerConsumer(inventoryAlert);
	mediator.registerConsumer(notificationDispatcher);

	console.log('\n' + '='.repeat(50));
	console.log('Executing Individual Data Flows');
	console.log('='.repeat(50));

	// Execute specific data flows
	mediator.executeDataFlow(userAnalytics);

	console.log('\n' + '-'.repeat(50));
	mediator.executeDataFlow(orderProcessing);

	console.log('\n' + '-'.repeat(50));
	mediator.executeDataFlow(inventoryAlert);

	console.log('\n' + '='.repeat(50));
	console.log('Executing All Data Flows');
	console.log('='.repeat(50));

	mediator.executeAllDataFlows();

	console.log('\n' + '='.repeat(50));
	console.log('Mediator Statistics');
	console.log('='.repeat(50));

	const stats = mediator.getStatistics();
	console.log(`Total Producers: ${stats.producerCount}`);
	console.log(`Total Consumers: ${stats.consumerCount}`);
	console.log('\nConnections:');
	stats.connections.forEach((producers, consumer) => {
		console.log(`  ${consumer} <- [${producers.join(', ')}]`);
	});

	console.log('\n' + '='.repeat(50));
	console.log('Type-Specific Queries');
	console.log('='.repeat(50));

	const userProducers = mediator.findProducersForType('user');
	console.log(`\nUser data producers: ${userProducers.map((p) => p.name).join(', ')}`);

	const userConsumers = mediator.findConsumersForType('user');
	console.log(`User data consumers: ${userConsumers.map((c) => c.name).join(', ')}`);
}

// Run the program
main();
