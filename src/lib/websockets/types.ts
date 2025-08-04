// your item shape
// import type { INamedEntity } from "uw-data-plane";

import type { Hash } from "crypto";


interface RemoveEvent {
	event: 'REMOVE';
	data: any;
}

interface InsertEvent {
	event: 'INSERT';
	data: any;
}

interface ModifyEvent {
	event: 'MODIFY';
	data: any;
}
// shape of a stream notification
export type StreamEvent = RemoveEvent | InsertEvent | ModifyEvent;
