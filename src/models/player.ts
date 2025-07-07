import Color from "./color";

interface Player {
  name: string;
  color: { hitColor: string };
  score?: number;
  laserId: string;
}

export default Player;
