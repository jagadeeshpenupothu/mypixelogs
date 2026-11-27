/** One recorded visit or action. Short keys keep stored batches small. */
export type Hit = {
  /** time (ms) */ t: number;
  /** anonymous visitor id */ v: string;
  /** session id */ s: string;
  /** event name: page_view, asset_download, audio_play, … */ e: string;
  /** page path */ p: string;
  /** country code */ c?: string;
  /** device: mobile | tablet | desktop */ d?: string;
  /** browser */ b?: string;
  /** referrer host or utm source (first page of a visit) */ r?: string;
  /** page title */ ti?: string;
  /** event details */ x?: Record<string, string | number>;
  /** city and region (from Netlify's location lookup) */ ci?: string;
  rg?: string;
  /** operating system */ os?: string;
};
