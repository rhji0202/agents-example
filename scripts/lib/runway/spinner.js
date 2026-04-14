/**
 * 터미널 진행 표시기 (Python execute.py의 progress_indicator 포팅)
 */

const FRAMES = '◐◓◑◒';

/**
 * 스피너를 표시하면서 비동기 작업을 실행한다.
 * @param {string} label - 표시할 라벨
 * @param {() => Promise<T>} fn - 실행할 비동기 함수
 * @returns {Promise<T>} fn의 반환값
 */
export async function withSpinner(label, fn) {
  const t0 = Date.now();
  let idx = 0;

  const timer = setInterval(() => {
    const sec = Math.floor((Date.now() - t0) / 1000);
    const frame = FRAMES[idx % FRAMES.length];
    process.stderr.write(`\r${frame} ${label} [${sec}s]`);
    idx++;
  }, 120);

  try {
    const result = await fn();
    return result;
  } finally {
    clearInterval(timer);
    const elapsed = Math.floor((Date.now() - t0) / 1000);
    process.stderr.write(`\r${' '.repeat(label.length + 20)}\r`);
    // 경과 시간을 결과에 남기진 않지만 콘솔에 표시
    if (elapsed > 0) {
      process.stderr.write(`  ⏱ ${label} [${elapsed}s]\n`);
    }
  }
}
