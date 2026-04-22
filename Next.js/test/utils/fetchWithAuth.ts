/**
 * 인증이 필요한 API 요청을 위한 유틸리티 함수
 * 자동으로 쿠키에서 accessToken을 포함하여 요청합니다.
 */

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    return fetch(url, {
        ...options,
        credentials: 'include', // 쿠키 자동 포함
        headers: {
            ...options.headers,
        },
    });
}

/**
 * JSON 응답을 기대하는 인증 요청
 */
export async function fetchJsonWithAuth<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetchWithAuth(url, options);
    return response.json();
}

/**
 * 텍스트 응답을 기대하는 인증 요청
 */
export async function fetchTextWithAuth(url: string, options: RequestInit = {}): Promise<string> {
    const response = await fetchWithAuth(url, options);
    return response.text();
}
