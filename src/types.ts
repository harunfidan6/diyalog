export interface Choice {
  text: string;
  next_node_id: string;
}

export type SpeakerType = "Anlatıcı" | "Sağlık Profesyoneli" | "Hasta" | "Hasta Yakını" | string;

export type EmotionType = 
  | "neutral" 
  | "empathetic" 
  | "fearful" 
  | "angry" 
  | "defensive" 
  | "cheerful" 
  | "worried" 
  | "sad" 
  | "reassuring";

export type NodeType = "intro" | "dialogue" | "choice_point" | "end_node";

export interface ScenarioNode {
  id: string;
  speaker: SpeakerType;
  text: string;
  emotion: EmotionType;
  choices: Choice[];
  node_type: NodeType;
  score_impact?: string | null;
}

export interface Scenario {
  scenario_title: string;
  target_audience: string;
  nodes: ScenarioNode[];
}
