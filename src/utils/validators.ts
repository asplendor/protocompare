const MAX_SIZE_BYTES = 1_000_000; // 1MB

/**
 * Validate raw HTML string before rendering.
 * Throws a human-readable Error on failure.
 */
export function validateHTML(code: string): void {
  const trimmed = code.trim();
  if (!trimmed) {
    throw new Error('No code provided. Paste your HTML or upload a file.');
  }
  if (code.length > MAX_SIZE_BYTES) {
    throw new Error(
      'File exceeds the 1MB limit. Try removing large inline images or base64-encoded assets.',
    );
  }
}

/**
 * Validate an uploaded File before reading its contents.
 * Throws a human-readable Error on failure.
 */
export function validateFile(file: File): void {
  const name = file.name.toLowerCase();
  if (!name.endsWith('.html') && !name.endsWith('.htm')) {
    throw new Error(
      'ProtoCompare supports .html files only. Ask Claude to export your prototype as a single self-contained HTML file — it takes one prompt.',
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(
      'File exceeds the 1MB limit. Try removing large inline images or base64-encoded assets.',
    );
  }
}

/**
 * Read a File as text using FileReader.
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file contents.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
