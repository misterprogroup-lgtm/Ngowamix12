import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { VOICE_TAG_PATH, VOICE_TAG_DELAY_MS } from './voicetag';

const execFileAsync = promisify(execFile);

function getFfmpegPath(): string {
  if (process.env.FFMPEG_BIN) return process.env.FFMPEG_BIN;

  const localPath = path.join(
    process.cwd(),
    'node_modules',
    'ffmpeg-static',
    'ffmpeg'
  );

  if (fs.existsSync(localPath)) return localPath;

  try {
    const resolved = require('ffmpeg-static');
    if (typeof resolved === 'string' && resolved.length > 0) return resolved;
  } catch {}

  return 'ffmpeg';
}

const ffmpegPath = getFfmpegPath();

export async function applyVoiceTag(
  inputPath: string,
  outputPath: string
): Promise<void> {
  let ffmpegAvailable = false;
  try {
    await execFileAsync(ffmpegPath, ['-version']);
    ffmpegAvailable = true;
  } catch {
    ffmpegAvailable = false;
  }

  if (!ffmpegAvailable) {
    fs.copyFileSync(inputPath, outputPath);
    return;
  }

  const VOICE_TAG_EXISTS = await fs.promises.stat(VOICE_TAG_PATH).then(() => true).catch(() => false);
  if (!VOICE_TAG_EXISTS) {
    fs.copyFileSync(inputPath, outputPath);
    return;
  }

  const tempOutput = outputPath + '.tmp.' + path.extname(outputPath);

  const args = [
    '-y',
    '-i', inputPath,
    '-i', VOICE_TAG_PATH,
    '-filter_complex',
    `[1:a]adelay=${VOICE_TAG_DELAY_MS}|${VOICE_TAG_DELAY_MS}[a1];[0:a][a1]amix=inputs=2:duration=first[aout]`,
    '-map', '[aout]',
    '-ac', '2',
    '-ar', '44100',
    '-b:a', '192k',
    tempOutput,
  ];

  try {
    await execFileAsync(ffmpegPath, args);
    fs.renameSync(tempOutput, outputPath);
  } catch {
    fs.copyFileSync(inputPath, outputPath);
  }
}

const UPLOAD_DIR = process.env.VERCEL
  ? '/tmp/uploads/audio'
  : path.join(process.cwd(), 'public', 'uploads', 'audio');

export function getTempAudioPath(filename: string): string {
  const dir = path.join(UPLOAD_DIR, '.temp');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, filename);
}

export function getFinalAudioPath(filename: string): string {
  const dir = UPLOAD_DIR;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, filename);
}
