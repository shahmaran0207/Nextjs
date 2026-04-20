import { useEffect, useState } from 'react';

export function useKakaoMap() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 이미 로드되었는지 확인
    if (window.kakao && window.kakao.maps) {
      setIsLoaded(true);
      return;
    }

    // 스크립트가 이미 추가되었는지 확인
    const existingScript = document.querySelector(
      'script[src*="dapi.kakao.com"]'
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      return;
    }

    // 새 스크립트 추가
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=clusterer&autoload=false`;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      // cleanup은 하지 않음 (다른 페이지에서도 사용할 수 있으므로)
    };
  }, []);

  return isLoaded;
}
