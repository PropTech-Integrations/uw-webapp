// Widget type definitions
export type WidgetType = 
  | 'table' 
  | 'title' 
  | 'paragraph' 
  | 'image' 
  | 'lineChart' 
  | 'barChart' 
  | 'metric';

export interface Position {
  gridColumn: number;
  gridRow: number;
}

export interface Size {
  colSpan: number;
  rowSpan: number;
}

export interface WidgetConstraints {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface BaseWidget extends Position, Size, WidgetConstraints {
  id: string;
  type: WidgetType;
  locked?: boolean;
}

// Table Widget
export interface TableWidget extends BaseWidget {
  type: 'table';
  data: {
    headers: string[];
    rows: Array<Record<string, any>>;
    sortable?: boolean;
    paginated?: boolean;
  };
}

// Title Widget
export interface TitleWidget extends BaseWidget {
  type: 'title';
  data: {
    title: string;
    subtitle?: string;
    alignment?: 'left' | 'center' | 'right';
  };
}

// Paragraph Widget
export interface ParagraphWidget extends BaseWidget {
  type: 'paragraph';
  data: {
    content: string;
    markdown?: boolean;
  };
}

// Image Widget
export interface ImageWidget extends BaseWidget {
  type: 'image';
  data: {
    src: string;
    alt: string;
    objectFit?: 'cover' | 'contain' | 'fill';
  };
}

// Line Chart Widget
export interface LineChartWidget extends BaseWidget {
  type: 'lineChart';
  data: {
    datasets: Array<{
      label: string;
      data: number[];
      color?: string;
    }>;
    labels: string[];
    options?: {
      responsive?: boolean;
      maintainAspectRatio?: boolean;
    };
  };
}

// Bar Chart Widget
export interface BarChartWidget extends BaseWidget {
  type: 'barChart';
  data: {
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
    }>;
    labels: string[];
    orientation?: 'vertical' | 'horizontal';
  };
}

// Metric Widget
export interface MetricWidget extends BaseWidget {
  type: 'metric';
  data: {
    label: string;
    value: string | number;
    change?: number;
    changeType?: 'increase' | 'decrease';
    unit?: string;
  };
}

export type Widget = 
  | TableWidget 
  | TitleWidget 
  | ParagraphWidget 
  | ImageWidget 
  | LineChartWidget 
  | BarChartWidget 
  | MetricWidget;

export interface DashboardConfig {
  gridColumns: number;
  gridRows: number;
  gap: number;
  minCellHeight: number;
}

export interface DragState {
  isDragging: boolean;
  activeWidgetId: string | null;
  ghostPosition: Position | null;
}

export interface ResizeState {
  isResizing: boolean;
  activeWidgetId: string | null;
  resizeHandle: 'right' | 'bottom' | 'corner' | null;
}