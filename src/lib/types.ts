import type { Track } from 'erela.js';

export interface CustomTrack extends Track {
	position: number;
}

export interface Context {
	filter: string | null;
}
