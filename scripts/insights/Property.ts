import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

//////////////////////////////////////////////////////////////////////////////////
// Interfaces
export interface InsightJSON {
	SK: string;
	hash?: string;
	pageId?: string;
	text?: string;
	document: IDocument;
	category?: string;
	confidence?: number;
	name?: string;
	value?: string;
	uri?: string;
	type?: string;
	[key: string]: unknown;
}

interface IProperty {
	document: IDocument;
	pages: IPage[];
	texts: IText[];
	images: IImage[];
	insights: IInsight[];
}

interface IDocument {
	hash: string;
}

interface IPage {
	hash: string;
	pageId: string;
	uri: string;
	document: IDocument;
}

interface IText {
	hash: string;
	text: string;
	pageId: string;
	uri: string;
	document: IDocument;
}

interface IImage {
	hash: string;
	pageId: string;
	uri: string;
	document: IDocument;
}

interface IInsight {
	hash: string;
	category: string;
	confidence: number;
	pageId: string;
	name: string;
	value: string;
	type: string;
	document: IDocument;
}

//////////////////////////////////////////////////////////////////////////////////
// Classes
// export class Document implements IDocument {
// 	constructor(public hash: string) {}
// }

// export class Page implements IPage {
// 	constructor(public hash: string) {}
// }

//////////////////////////////////////////////////////////////////////////////////
// Functions
const classifySK = (SK: string): string => {
	const parts = SK.split('#');

	if (parts.length > 0 && parts[0] == 'METADATA') {
		return 'DOCUMENT';
	}
	return parts.length > 1 ? parts[1] : SK;
};

//////////////////////////////////////////////////////////////////////////////////
// Main
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const insightsJSON: InsightJSON[] = JSON.parse(
	readFileSync(join(__dirname, './InsightsArray.json'), 'utf8')
);

let document: IDocument = {
	hash: ''
};
let pages: IPage[] = [];
let texts: IText[] = [];
let images: IImage[] = [];
let insights: IInsight[] = [];

const parseDocument = (insight: InsightJSON): IDocument => {
	const classifyType = classifySK(insight.SK);
	if (classifyType == 'DOCUMENT' && insight.hash) {
		document.hash = insight.hash;
	}
	return document;
};

const parsePage = (insight: InsightJSON): IPage => {
	if (!insight.hash || !insight.pageId) {
		throw new Error('Missing required fields: hash or pageId');
	}

	const uri = `https://uw-dev-documents-e1tez94r.s3.us-west-2.amazonaws.com/${insight.document.hash}/pages/${insight.pageId}.pdf`;
	return {
		hash: insight.hash,
		pageId: insight.pageId,
		uri: uri,
		document: document
	};
};

const parseText = (insight: InsightJSON): IText => {
	if (!insight.hash || !insight.text || !insight.pageId) {
		throw new Error('Missing required fields: hash, text, or pageId');
	}
	const uri = `https://uw-dev-documents-e1tez94r.s3.us-west-2.amazonaws.com/${insight.key}`;
	return {
		hash: insight.hash,
		text: insight.text,
		pageId: insight.pageId,
		uri: uri,
		document: document
	};
};

const parseImage = (insight: InsightJSON): IImage => {
	if (!insight.hash || !insight.pageId) {
		throw new Error('Missing required fields: hash, image, or pageId');
	}

	const uri = `https://uw-dev-documents-e1tez94r.s3.us-west-2.amazonaws.com/${insight.key}`;
	return {
		hash: insight.hash,
		pageId: insight.pageId,
		uri: uri,
		document: document
	};
};

const parseInsight = (insight: InsightJSON): IInsight => {
	if (!insight.hash || !insight.category || !insight.pageId || !insight.name || !insight.value) {
		throw new Error('Missing required fields: hash, category, pageId, name, or value');
	}
	return {
		hash: insight.hash,
		category: insight.category,
		confidence: insight.confidence || 0,
		pageId: insight.pageId,
		name: insight.name,
		value: insight.value,
		type: insight.type || '',
		document: document
	};
};

const buildProperty = (insightsJSON: InsightJSON[]): IProperty => {
	insightsJSON.forEach((insight) => {
		const classifyType = classifySK(insight.SK);

		if (classifyType == 'DOCUMENT') {
			document = parseDocument(insight);
		} else if (classifyType == 'PAGE') {
			// console.log(JSON.stringify(insight, null, 2));
			pages.push(parsePage(insight));
		} else if (classifyType == 'TEXT') {
			texts.push(parseText(insight));
		} else if (classifyType == 'IMAGE') {
			images.push(parseImage(insight));
		} else if (classifyType == 'INSIGHT') {
			insights.push(parseInsight(insight));
		}
	});

	const property: IProperty = {
		document: document,
		pages: pages,
		texts: texts,
		images: images,
		insights: insights
	};

	return property;
};

const property = buildProperty(insightsJSON);

// console.log(property);
// console.log(JSON.stringify(property, null, 2));
// console.log('property.pages.length', property.pages.length);
// console.log('property.texts.length', property.texts.length);
// console.log('property.images.length', property.images.length);
// console.log('property.insights.length', property.insights.length);
