import axios from 'axios';
import type { components } from './api-schema';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export type JobResponse = components['schemas']['JobResponse'];
export type JobRequest = components['schemas']['JobRequest'];
export type RenderRequest = components['schemas']['RenderRequest'];
export type DigestRequest = components['schemas']['DigestRequest'];

export const processVideo = async (url: string): Promise<JobResponse> => {
    const body: JobRequest = { url };
    const response = await api.post<JobResponse>('/process', body);
    return response.data;
};

export const getJobStatus = async (jobId: string): Promise<JobResponse> => {
    const response = await api.get<JobResponse>(`/status/${jobId}`);
    return response.data;
};

export const renderVideo = async (
    jobId: string,
    start: number,
    end: number,
    vertical_mode: boolean,
    subtitles: boolean,
    use_narration: boolean,
    use_thumbnail: boolean,
    narration_script?: string,
    thumbnail_title?: string
): Promise<JobResponse> => {
    const body: RenderRequest = {
        start,
        end,
        vertical_mode,
        subtitles,
        subtitle_position: 'bottom',
        use_narration,
        use_thumbnail,
        narration_script: narration_script || null,
        thumbnail_title: thumbnail_title || null,
        bgm_file: null,
        upload_to_youtube: false,
        youtube_privacy: 'private'
    };
    const response = await api.post<JobResponse>(`/render/${jobId}`, body);
    return response.data;
};

export const createDigest = async (jobId: string, durationMinutes: number = 5): Promise<JobResponse> => {
    const body: DigestRequest = {
        duration_minutes: durationMinutes,
        model_name: "gemini-2.5-flash",
        upload_to_youtube: false,
        youtube_privacy: 'private'
    };
    const response = await api.post<JobResponse>(`/digest/${jobId}`, body);
    return response.data;
};
