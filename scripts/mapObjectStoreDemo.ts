// example-app.ts
// A comprehensive example showcasing MapStore use cases
// This simulates a e-commerce application with various services and components

import { mapStore, createProducer, createConsumer, createProducerConsumer } from './mapObjectStore';
import type { Unsubscriber } from 'svelte/store';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'vendor';
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  token?: string;
  userId?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  vendorId: string;
}

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Cart {
  items: CartItem[];
  total: number;
  userId: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

interface Analytics {
  event: string;
  data: Record<string, any>;
  timestamp: Date;
}

interface SearchQuery {
  term: string;
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  };
}

interface SearchResults {
  query: SearchQuery;
  products: Product[];
  count: number;
}

// ============================================
// SERVICES (Producers)
// ============================================

class AuthenticationService {
  private auth = mapStore.registerProducer<AuthState>('auth', 'authService', {
    isAuthenticated: false
  });

  login(email: string, password: string) {
    console.log('🔐 AuthService: Logging in user...');
    // Simulate API call
    setTimeout(() => {
      this.auth.publish({
        isAuthenticated: true,
        token: 'jwt-token-123',
        userId: 'user-1'
      });
    }, 500);
  }

  logout() {
    console.log('🔐 AuthService: Logging out user...');
    this.auth.publish({
      isAuthenticated: false
    });
  }
}

class UserService {
  private user = mapStore.registerProducer<User>('user', 'userService');
  private authConsumer = mapStore.registerConsumer<AuthState>('auth', 'userService-auth');

  constructor() {
    // Listen to auth changes to fetch user data
    this.authConsumer.subscribe(auth => {
      if (auth?.isAuthenticated && auth.userId) {
        this.fetchUserData(auth.userId);
      } else {
        this.user.clear();
      }
    });
  }

  private fetchUserData(userId: string) {
    console.log('👤 UserService: Fetching user data...');
    // Simulate API call
    setTimeout(() => {
      this.user.publish({
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
        preferences: {
          theme: 'dark',
          notifications: true
        }
      });
    }, 300);
  }

  updatePreferences(preferences: Partial<User['preferences']>) {
    this.user.update(current => {
      if (!current) return current;
      return {
        ...current,
        preferences: { ...current.preferences, ...preferences }
      };
    });
  }
}

class ProductService {
  private products = mapStore.registerProducer<Product[]>('products', 'productService', []);
  private searchConsumer = mapStore.registerConsumer<SearchQuery>('search', 'productService-search');
  private searchResultsProducer = mapStore.registerProducer<SearchResults>('searchResults', 'productService-results');

  constructor() {
    // Initialize with some products
    this.loadProducts();

    // Listen to search queries
    this.searchConsumer.subscribe(query => {
      if (query) {
        this.performSearch(query);
      }
    });
  }

  private loadProducts() {
    console.log('📦 ProductService: Loading products...');
    const mockProducts: Product[] = [
      { id: 'p1', name: 'Laptop', price: 999, stock: 5, vendorId: 'v1' },
      { id: 'p2', name: 'Mouse', price: 29, stock: 50, vendorId: 'v2' },
      { id: 'p3', name: 'Keyboard', price: 79, stock: 0, vendorId: 'v2' },
      { id: 'p4', name: 'Monitor', price: 299, stock: 10, vendorId: 'v1' },
      { id: 'p5', name: 'Headphones', price: 149, stock: 15, vendorId: 'v3' }
    ];
    this.products.publish(mockProducts);
  }

  private performSearch(query: SearchQuery) {
    console.log('🔍 ProductService: Searching for:', query.term);
    const allProducts = this.products.update(p => p || []);
    
    const filtered = (allProducts as any as Product[]).filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(query.term.toLowerCase());
      const matchesPrice = (!query.filters?.minPrice || product.price >= query.filters.minPrice) &&
                          (!query.filters?.maxPrice || product.price <= query.filters.maxPrice);
      const matchesStock = !query.filters?.inStock || product.stock > 0;
      
      return matchesSearch && matchesPrice && matchesStock;
    });

    this.searchResultsProducer.publish({
      query,
      products: filtered,
      count: filtered.length
    });
  }

  updateStock(productId: string, quantity: number) {
    this.products.update(products => {
      if (!products) return products;
      return products.map(p => 
        p.id === productId 
          ? { ...p, stock: Math.max(0, p.stock - quantity) }
          : p
      );
    });
  }
}

// ============================================
// SHARED SERVICES (Producer-Consumers)
// ============================================

class CartService {
  private cart = mapStore.register<Cart>('cart', 'cartService');
  private userConsumer = mapStore.registerConsumer<User>('user', 'cartService-user');
  private productsConsumer = mapStore.registerConsumer<Product[]>('products', 'cartService-products');
  private currentUserId?: string;

  constructor() {
    // Track current user
    this.userConsumer.subscribe(user => {
      if (user?.id !== this.currentUserId) {
        this.currentUserId = user?.id;
        if (user) {
          this.loadCart(user.id);
        } else {
          this.cart.clear();
        }
      }
    });
  }

  private loadCart(userId: string) {
    console.log('🛒 CartService: Loading cart for user:', userId);
    // Initialize empty cart
    this.cart.publish({
      items: [],
      total: 0,
      userId
    });
  }

  addToCart(productId: string) {
    const products = this.productsConsumer.get();
    const product = products?.find(p => p.id === productId);
    
    if (!product) {
      console.error('Product not found');
      return;
    }

    if (product.stock === 0) {
      console.error('Product out of stock');
      return;
    }

    console.log('🛒 CartService: Adding to cart:', product.name);
    
    this.cart.update(cart => {
      if (!cart) return cart;
      
      const existingItem = cart.items.find(item => item.productId === productId);
      const newItems = existingItem
        ? cart.items.map(item => 
            item.productId === productId 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...cart.items, { productId, quantity: 1, price: product.price }];
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...cart,
        items: newItems,
        total
      };
    });
  }

  removeFromCart(productId: string) {
    this.cart.update(cart => {
      if (!cart) return cart;
      
      const newItems = cart.items.filter(item => item.productId !== productId);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...cart,
        items: newItems,
        total
      };
    });
  }
}

class NotificationService {
  private notifications = mapStore.register<Notification[]>('notifications', 'notificationService', []);
  private idCounter = 0;

  push(message: string, type: Notification['type'] = 'info') {
    console.log(`📢 NotificationService: ${type.toUpperCase()} - ${message}`);
    
    const notification: Notification = {
      id: `notif-${++this.idCounter}`,
      message,
      type,
      timestamp: new Date()
    };

    this.notifications.update(current => {
      const notifications = current || [];
      return [...notifications, notification];
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.remove(notification.id);
    }, 5000);
  }

  remove(id: string) {
    this.notifications.update(current => 
      current?.filter(n => n.id !== id) || []
    );
  }
}

// ============================================
// ANALYTICS SERVICE (Consumer with side effects)
// ============================================

class AnalyticsService {
  private analytics = mapStore.registerProducer<Analytics>('analytics', 'analyticsService');
  private subscriptions: Unsubscriber[] = [];

  constructor() {
    // Track various events across the system
    const authConsumer = mapStore.registerConsumer<AuthState>('auth', 'analytics-auth');
    const cartConsumer = mapStore.registerConsumer<Cart>('cart', 'analytics-cart');
    const searchConsumer = mapStore.registerConsumer<SearchResults>('searchResults', 'analytics-search');

    this.subscriptions.push(
      authConsumer.subscribe(auth => {
        if (auth?.isAuthenticated) {
          this.track('user_login', { userId: auth.userId });
        } else if (auth?.isAuthenticated === false) {
          this.track('user_logout', {});
        }
      }),

      cartConsumer.subscribe(cart => {
        if (cart && cart.items.length > 0) {
          this.track('cart_updated', { 
            itemCount: cart.items.length,
            total: cart.total 
          });
        }
      }),

      searchConsumer.subscribe(results => {
        if (results) {
          this.track('search_performed', {
            query: results.query.term,
            resultCount: results.count
          });
        }
      })
    );
  }

  private track(event: string, data: Record<string, any>) {
    console.log(`📊 Analytics: ${event}`, data);
    this.analytics.publish({
      event,
      data,
      timestamp: new Date()
    });
  }

  destroy() {
    this.subscriptions.forEach(unsub => unsub());
  }
}

// ============================================
// BRIDGES - Connect different data types
// ============================================

class SystemBridges {
  private bridges: Unsubscriber[] = [];
  
  constructor(notificationService: NotificationService) {
    // Bridge: Auth changes -> Notifications
    this.bridges.push(
      mapStore.registerBridge<AuthState, Notification[]>(
        'auth',
        'notifications',
        'authNotificationBridge',
        (auth) => {
          notificationService.push(
            auth.isAuthenticated ? 'Welcome back!' : 'You have been logged out',
            auth.isAuthenticated ? 'success' : 'info'
          );
          return notificationService.notifications.get() || [];
        }
      )
    );

    // Bridge: Cart updates -> Stock updates (with debounce)
    const productService = new ProductService();
    this.bridges.push(
      mapStore.registerBridge<Cart, Product[]>(
        'cart',
        'products', 
        'cartStockBridge',
        (cart) => {
          // In real app, this would sync with backend
          console.log('🔄 Bridge: Syncing stock levels after cart update');
          return productService.products.get() || [];
        },
        {
          debounceMs: 1000 // Debounce stock updates
        }
      )
    );
  }

  destroy() {
    this.bridges.forEach(unsub => unsub());
  }
}

// ============================================
// UI COMPONENTS (Consumers)
// ============================================

class HeaderComponent {
  private authConsumer = mapStore.registerConsumer<AuthState>('auth', 'header-auth');
  private userConsumer = mapStore.registerConsumer<User>('user', 'header-user');
  private cartConsumer = mapStore.registerConsumer<Cart>('cart', 'header-cart');

  constructor() {
    this.authConsumer.subscribe(auth => {
      console.log('🎨 Header: Auth state:', auth?.isAuthenticated ? 'Logged In' : 'Logged Out');
    });

    this.userConsumer.subscribe(user => {
      if (user) {
        console.log(`🎨 Header: Welcome, ${user.name} (${user.role})`);
      }
    });

    this.cartConsumer.subscribe(cart => {
      if (cart) {
        console.log(`🎨 Header: Cart (${cart.items.length} items, $${cart.total})`);
      }
    });
  }
}

class SearchComponent {
  private searchProducer = mapStore.registerProducer<SearchQuery>('search', 'searchComponent');
  private resultsConsumer = mapStore.registerConsumer<SearchResults>('searchResults', 'searchComponent-results');

  constructor() {
    this.resultsConsumer.subscribe(results => {
      if (results) {
        console.log(`🎨 Search: Found ${results.count} products for "${results.query.term}"`);
        results.products.forEach(p => {
          console.log(`   - ${p.name}: $${p.price} (${p.stock} in stock)`);
        });
      }
    });
  }

  search(term: string, filters?: SearchQuery['filters']) {
    this.searchProducer.publish({ term, filters });
  }
}

class NotificationDisplay {
  private consumer = mapStore.registerConsumer<Notification[]>('notifications', 'notificationDisplay');

  constructor() {
    this.consumer.subscribe(notifications => {
      if (notifications && notifications.length > 0) {
        const latest = notifications[notifications.length - 1];
        console.log(`🔔 Notification [${latest.type}]: ${latest.message}`);
      }
    });
  }
}

// ============================================
// DERIVED CONSUMERS - Transform data
// ============================================

class ThemeManager {
  private themeConsumer = mapStore.registerDerivedConsumer<User, 'light' | 'dark'>(
    'user',
    'themeManager',
    (user) => user?.preferences.theme || 'light'
  );

  constructor() {
    this.themeConsumer.subscribe(theme => {
      if (theme) {
        console.log(`🎨 Theme: Switching to ${theme} mode`);
        // In real app, would update CSS variables, classes, etc.
      }
    });
  }
}

class AdminDashboard {
  private isAdminConsumer = mapStore.registerDerivedConsumer<User, boolean>(
    'user',
    'adminDashboard',
    (user) => user?.role === 'admin'
  );

  private analyticsConsumer = mapStore.registerConsumer<Analytics>('analytics', 'adminDashboard-analytics');

  constructor() {
    this.isAdminConsumer.subscribe(isAdmin => {
      if (isAdmin) {
        console.log('👨‍💼 Admin Dashboard: Access granted');
        this.startMonitoring();
      } else {
        console.log('👨‍💼 Admin Dashboard: Access denied');
      }
    });
  }

  private startMonitoring() {
    this.analyticsConsumer.subscribe(analytics => {
      if (analytics) {
        console.log(`👨‍💼 Admin: Event "${analytics.event}" at ${analytics.timestamp.toISOString()}`);
      }
    });
  }
}

// ============================================
// MAIN APPLICATION
// ============================================

async function runApplication() {
  console.log('🚀 Starting E-Commerce Application\n');
  console.log('=' .repeat(50));

  // Initialize services
  const authService = new AuthenticationService();
  const userService = new UserService();
  const productService = new ProductService();
  const cartService = new CartService();
  const notificationService = new NotificationService();
  const analyticsService = new AnalyticsService();

  // Initialize UI components
  const header = new HeaderComponent();
  const search = new SearchComponent();
  const notificationDisplay = new NotificationDisplay();
  const themeManager = new ThemeManager();
  const adminDashboard = new AdminDashboard();

  // Set up bridges
  const bridges = new SystemBridges(notificationService);

  // Helper function to wait
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  console.log('\n📍 Scenario 1: User Login Flow');
  console.log('-'.repeat(30));
  authService.login('john@example.com', 'password');
  await wait(1000);

  console.log('\n📍 Scenario 2: Product Search');
  console.log('-'.repeat(30));
  search.search('laptop', { minPrice: 500 });
  await wait(500);

  console.log('\n📍 Scenario 3: Add to Cart');
  console.log('-'.repeat(30));
  cartService.addToCart('p1'); // Laptop
  await wait(500);
  cartService.addToCart('p2'); // Mouse
  await wait(500);

  console.log('\n📍 Scenario 4: Check System State');
  console.log('-'.repeat(30));
  console.log('System Type Registry:', mapStore.getTypeInfo());

  console.log('\n📍 Scenario 5: User Preferences Update');
  console.log('-'.repeat(30));
  userService.updatePreferences({ theme: 'light' });
  await wait(500);

  console.log('\n📍 Scenario 6: Search with Filters');
  console.log('-'.repeat(30));
  search.search('', { maxPrice: 100, inStock: true });
  await wait(500);

  console.log('\n📍 Scenario 7: Logout');
  console.log('-'.repeat(30));
  authService.logout();
  await wait(500);

  console.log('\n📍 Final System State');
  console.log('-'.repeat(30));
  console.log('Type Information:');
  mapStore.getTypeInfo().forEach(info => {
    console.log(`  ${info.typeId}: ${info.producerCount} producers, ${info.consumerCount} consumers`);
  });

  // Cleanup
  analyticsService.destroy();
  bridges.destroy();
  
  console.log('\n✅ Application demo completed!');
}

// Run the application
runApplication().catch(console.error);