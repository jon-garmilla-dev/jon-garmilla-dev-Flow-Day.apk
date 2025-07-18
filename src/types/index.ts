export interface Action {
  id: string;
  name: string;
  type: 'timer' | 'reps' | 'weight' | 'note' | 'task';
  duration?: number; // in seconds, for timer type
  reps?: number;
  weight?: number;
  note?: string;
  icon?: string;
  color?: string;
}

export interface Block {
  id: string;
  name:string;
  icon?: string;
  actions: Action[];
}

export interface Routine {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  blocks: Block[];
}
