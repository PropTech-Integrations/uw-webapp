// your item shape
import type { INamedEntity } from "uw-data-plane";

import type { Hash } from "crypto";


interface RemoveEvent {
	event: 'REMOVE';
	data: INamedEntity;
}

interface InsertEvent {
	event: 'INSERT';
	data: INamedEntity;
}

interface ModifyEvent {
	event: 'MODIFY';
	data: INamedEntity;
}
// shape of a stream notification
export type StreamEvent = RemoveEvent | InsertEvent | ModifyEvent;
