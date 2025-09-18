// Type definitions
export interface PDFViewerProps {
	url?: string;
	data?: Uint8Array | null;
	scale?: number;
	pageNum?: number;
	flipTime?: number;
	showButtons?: string[];
	showBorder?: boolean;
	totalPage?: number;
	currentPage?: number;
	downloadFileName?: string;
	showTopButton?: boolean;
	onProgress?: (progress: { loaded: number; total: number }) => void;
	externalLinksTarget?: string;
}

export interface PDFAnnotation {
	subtype: string;
	url?: string;
	rect: number[];
}

export interface PDFPage {
	getViewport: (options: { scale: number; rotation: number }) => any;
	render: (context: any) => { promise: Promise<void> };
	getAnnotations: () => Promise<PDFAnnotation[]>;
}

export interface PDFDocument {
	numPages: number;
	getPage: (pageNumber: number) => Promise<PDFPage>;
}

export interface Viewport {
	height: number;
	width: number;
	convertToViewportRectangle: (rect: number[]) => number[];
}

export interface RenderContext {
	canvasContext: CanvasRenderingContext2D;
	viewport: Viewport;
}

export interface DownloadOptions {
	url?: string;
	data?: Uint8Array | null;
}
