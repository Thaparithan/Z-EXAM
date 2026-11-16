// Backward compatible adapter re-exporting master curriculum constants
export * from './curriculum.js';
import { MASTER_SUBJECTS } from './curriculum.js';
export const SUBJECTS = MASTER_SUBJECTS;
