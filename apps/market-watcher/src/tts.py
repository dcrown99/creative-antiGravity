
import requests

from .config import VOICEVOX_URL


class VoicevoxClient:
    def __init__(self):
        self.base_url = VOICEVOX_URL

    def generate_audio(self, text, speaker=1):
        # Split text into chunks to avoid Voicevox crashes
        chunks = self._split_text(text, max_length=150)
        audio_chunks = []

        for chunk in chunks:
            if not chunk.strip():
                continue
            audio = self._generate_single_audio(chunk, speaker)
            if audio:
                audio_chunks.append(audio)

        if not audio_chunks:
            return None

        return self._concatenate_wavs(audio_chunks)

    def _split_text(self, text, max_length=150):
        import re
        # Split by punctuation
        sentences = re.split(r'([。．！？\.\?!])', text)
        chunks = []
        current_chunk = ""

        for sentence in sentences:
            if len(current_chunk) + len(sentence) > max_length:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = sentence
            else:
                current_chunk += sentence

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    def _generate_single_audio(self, text, speaker=1):
        try:
            # 1. Audio Query
            query_payload = {"text": text, "speaker": speaker}
            query_response = requests.post(
                f"{self.base_url}/audio_query",
                params=query_payload
            )
            query_response.raise_for_status()
            query_data = query_response.json()

            # 2. Synthesis
            synthesis_payload = {"speaker": speaker}
            synthesis_response = requests.post(
                f"{self.base_url}/synthesis",
                params=synthesis_payload,
                json=query_data
            )
            synthesis_response.raise_for_status()

            return synthesis_response.content

        except Exception as e:
            print(f"Voicevox Error: {e}")
            return None

    def _concatenate_wavs(self, audio_chunks):
        if not audio_chunks:
            return None
        if len(audio_chunks) == 1:
            return audio_chunks[0]

        # Basic WAV header handling (assuming 44 byte header)
        header = audio_chunks[0][:44]
        data = audio_chunks[0][44:]

        for chunk in audio_chunks[1:]:
            data += chunk[44:]

        # Update file size in header
        total_size = len(header) + len(data)
        import struct
        # RIFF chunk size (total file size - 8)
        riff_size = total_size - 8
        # Data subchunk size (total data size)
        data_size = len(data)

        new_header = bytearray(header)
        new_header[4:8] = struct.pack('<I', riff_size)
        new_header[40:44] = struct.pack('<I', data_size)

        return bytes(new_header) + data
