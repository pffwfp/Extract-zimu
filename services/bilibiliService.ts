// Uses a public CORS proxy to bypass browser restrictions
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export const fetchBilibiliSubtitles = async (videoUrl: string, onProgress: (msg: string) => void): Promise<string> => {
  try {
    // 1. Extract BV ID and Page Number (p)
    const bvMatch = videoUrl.match(/(BV[a-zA-Z0-9]+)/);
    if (!bvMatch) {
      throw new Error("Invalid Bilibili URL. Please ensure it contains a BV ID (e.g., BV1xx...).");
    }
    const bvid = bvMatch[1];
    
    // Check for page parameter ?p=2
    let pageNumber = 1;
    try {
        const urlObj = new URL(videoUrl);
        const pParam = urlObj.searchParams.get('p');
        if (pParam) {
            pageNumber = parseInt(pParam, 10);
        }
    } catch (e) {
        // Fallback if URL parsing fails, ignore page param
    }

    onProgress(`Fetching video metadata for ${bvid} (Page ${pageNumber})...`);

    // 2. Call Bilibili Web Interface View API
    // This API provides detailed video info including AID and CID for all pages
    // It also often contains the subtitle list (including AI subtitles) in 'data.subtitle.list'
    const viewApiUrl = `${CORS_PROXY}${encodeURIComponent(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`)}`;
    
    const viewResponse = await fetch(viewApiUrl);
    if (!viewResponse.ok) {
        throw new Error(`Network error when fetching video metadata: ${viewResponse.statusText}`);
    }
    
    const viewData = await viewResponse.json();

    if (viewData.code !== 0) {
        throw new Error(`Bilibili API Error: ${viewData.message || 'Unknown error code ' + viewData.code}`);
    }

    const { aid, pages, subtitle } = viewData.data;
    
    if (!aid || !pages) {
         throw new Error("Invalid API response: AID or Pages missing.");
    }

    // Collect subtitles from View API first
    let allSubtitles: any[] = [];
    if (subtitle && subtitle.list) {
        allSubtitles = [...subtitle.list];
    }

    // 3. Find the CID for the specific page
    const pageInfo = pages.find((p: any) => p.page === pageNumber) || pages[0];
    const cid = pageInfo.cid;

    if (!cid) {
        throw new Error(`Could not find CID for page ${pageNumber}.`);
    }

    onProgress(`Video found (AID: ${aid}, CID: ${cid}). Checking for detailed subtitle tracks...`);

    // 4. Fetch Player API to get subtitle list
    // This API often returns the most up-to-date available subtitle tracks for the player
    try {
        const playerApiUrl = `${CORS_PROXY}${encodeURIComponent(`https://api.bilibili.com/x/player/v2?cid=${cid}&aid=${aid}`)}`;
        const playerResponse = await fetch(playerApiUrl);
        const playerData = await playerResponse.json();
        const playerSubtitles = playerData?.data?.subtitle?.subtitles;

        if (playerSubtitles && Array.isArray(playerSubtitles)) {
            // Merge player subtitles into allSubtitles, avoiding duplicates by id
            for (const sub of playerSubtitles) {
                if (!allSubtitles.find(s => s.id === sub.id)) {
                    allSubtitles.push(sub);
                }
            }
        }
    } catch (e) {
        console.warn("Player API fetch failed, continuing with View API data only.", e);
    }

    if (allSubtitles.length === 0) {
       throw new Error("No subtitles found (CC or AI) for this video. Please try uploading the video/audio file instead.");
    }

    onProgress(`Found ${allSubtitles.length} subtitle track(s). Downloading...`);

    // 5. Select the best subtitle
    // Priority: 
    // 1. zh-CN (Simplified Chinese)
    // 2. zh-Hans (Simplified Chinese)
    // 3. AI Generated Chinese (often labelled differently or just included in list)
    // 4. Any other available
    
    // Sort/Find logic:
    // We prefer non-AI if possible? Actually usually AI is better than nothing.
    // Let's just grab the first 'zh-CN' or 'zh-Hans'.
    
    let selectedSub = allSubtitles.find((s: any) => s.lan === 'zh-CN');
    if (!selectedSub) selectedSub = allSubtitles.find((s: any) => s.lan === 'zh-Hans');
    if (!selectedSub) selectedSub = allSubtitles[0];
                        
    let subUrl = selectedSub.subtitle_url;
    if (!subUrl) {
        throw new Error("Subtitle object found but URL is missing.");
    }

    // Ensure protocol
    if (subUrl.startsWith('//')) {
        subUrl = 'https:' + subUrl;
    }

    // 6. Fetch the actual subtitle content
    const subContentUrl = `${CORS_PROXY}${encodeURIComponent(subUrl)}`;
    const subContentResponse = await fetch(subContentUrl);
    
    if (!subContentResponse.ok) {
        throw new Error("Failed to download subtitle content.");
    }

    // Bilibili usually returns a JSON object with a 'body' array
    const subText = await subContentResponse.text();
    
    return subText;

  } catch (error: any) {
    console.error("Bilibili Fetch Error:", error);
    if (error.message.includes("Failed to fetch")) {
        throw new Error("Network error. The proxy might be blocked or the URL is unreachable.");
    }
    throw error;
  }
};