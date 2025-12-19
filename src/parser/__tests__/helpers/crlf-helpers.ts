import { DecorationRange } from '../../../parser';

/**
 * Converts CRLF text to LF (normalized) text, matching parser behavior.
 * 
 * @param text - Text with any line endings
 * @returns Text normalized to LF line endings
 */
export function normalizeToLF(text: string): string {
  return text.replace(/\r\n|\r/g, '\n');
}

/**
 * Maps a position from normalized text (LF only) to original document text (with CRLF).
 * This matches the decorator's mapNormalizedToOriginal() behavior.
 * 
 * @param normalizedPos - Position in normalized text
 * @param originalText - Original document text (may contain CRLF)
 * @returns Position in original document text
 */
export function mapNormalizedToOriginal(normalizedPos: number, originalText: string): number {
  if (!originalText) {
    return normalizedPos;
  }

  // If no CRLF, positions match exactly
  if (!originalText.includes('\r\n')) {
    return normalizedPos;
  }

  // Build a direct character-by-character mapping
  // Walk through original text character by character, tracking normalized index
  // When normalized index reaches target, return the corresponding original position
  // 
  // Key insight: For exclusive end positions, when normalized position points to '\n',
  // we want to map to the '\r' position (not '\n') so that the content range excludes '\r'
  // This ensures [start:end) in normalized maps to [start:end) in original with same content
  let normalizedIndex = 0;
  
  for (let i = 0; i < originalText.length; i++) {
    // Check for CRLF first
    if (originalText[i] === '\r' && i + 1 < originalText.length && originalText[i + 1] === '\n') {
      // CRLF: '\r' is skipped in normalized, '\n' maps to normalized position
      // If target is at the normalized '\n' position, return '\r' position (i)
      // This ensures exclusive end positions work correctly
      if (normalizedIndex === normalizedPos) {
        // Target points to '\n' in normalized, map to '\r' in original
        return i;
      }
      // Advance normalized index by 1 (for the single '\n' in normalized)
      normalizedIndex++;
      i++; // Skip the '\n' in original
      // Continue to next iteration - don't check here, let the loop handle it
    } else {
      // Regular character: check if this is our target before incrementing
      if (normalizedIndex === normalizedPos) {
        return i;
      }
      normalizedIndex++;
    }
  }
  
  // If we didn't find it (shouldn't happen), return the last position
  return originalText.length;
}

/**
 * Verifies that a decoration's position in the original text matches expected content.
 * 
 * @param decoration - The decoration to verify
 * @param originalText - Original document text (with CRLF)
 * @param expectedText - Expected text content at decoration position
 * @returns True if decoration text matches expected text
 */
export function verifyDecorationPosition(
  decoration: DecorationRange,
  originalText: string,
  expectedText: string
): boolean {
  // Map normalized positions to original positions
  const originalStart = mapNormalizedToOriginal(decoration.startPos, originalText);
  const originalEnd = mapNormalizedToOriginal(decoration.endPos, originalText);
  
  // Extract actual text at decoration position
  const actualText = originalText.substring(originalStart, originalEnd);
  
  return actualText === expectedText;
}

/**
 * Converts LF text to CRLF text for testing.
 * 
 * @param lfText - Text with LF line endings
 * @returns Text with CRLF line endings
 */
export function createCRLFText(lfText: string): string {
  return lfText.replace(/\n/g, '\r\n');
}

/**
 * Extracts text at a decoration position from original CRLF text.
 * 
 * @param decoration - The decoration range
 * @param originalText - Original document text (with CRLF)
 * @returns The text content at the decoration position
 */
export function extractDecorationText(decoration: DecorationRange, originalText: string): string {
  const originalStart = mapNormalizedToOriginal(decoration.startPos, originalText);
  const originalEnd = mapNormalizedToOriginal(decoration.endPos, originalText);
  return originalText.substring(originalStart, originalEnd);
}

