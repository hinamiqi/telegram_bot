export interface IMenuConfig {
    id: string;
    name: string;
    description: string;
    parent?: IMenuConfig | null;
    children?: IMenuConfig[];
    isExercise?: boolean;
}