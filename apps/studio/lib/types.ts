export type GenerationInput = {
  emotion: string;
  protagonist: string;
  theme: string;
  time: string;
  place: string;
  situation: string;
};

export type GenerationOutput = {
  title: string;
  poem: string;
  sunoPrompt: string;
  imagePrompt: string;
  shortsScript: string;
  youtubeTitle: string;
};

export type WorkRecord = GenerationInput & GenerationOutput & {
  id: string;
  createdAt: string;
  updatedAt?: string;
};
