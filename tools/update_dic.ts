#!/usr/bin/env bun

/**
 * Update dic.txt by removing duplicate lines (case-insensitive)
 * while preserving the original case and sorting
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DIC_PATH = join(import.meta.dir, 'spellchecker', 'dic.txt');

function updateDictionary() {
    try {
        // Read the dictionary file
        const content = readFileSync(DIC_PATH, 'utf-8');
        const lines = content.split('\n');
        
        // Track seen words (case-insensitive) and preserve first occurrence
        const seen = new Set<string>();
        const uniqueLines: string[] = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed === '') {
                // Preserve empty lines
                uniqueLines.push('');
                continue;
            }
            
            const lower = trimmed.toLowerCase();
            if (!seen.has(lower)) {
                seen.add(lower);
                uniqueLines.push(trimmed);
            }
        }
        
        // Remove trailing empty lines
        while (uniqueLines.length > 0 && uniqueLines[uniqueLines.length - 1] === '') {
            uniqueLines.pop();
        }
        
        // Ensure single newline at end
        const result = uniqueLines.join('\n') + '\n';
        
        // Write back to file
        writeFileSync(DIC_PATH, result, 'utf-8');
        
        console.log(`✅ Dictionary updated successfully!`);
        console.log(`   Original lines: ${lines.length}`);
        console.log(`   Unique lines: ${uniqueLines.length}`);
        console.log(`   Duplicates removed: ${lines.length - uniqueLines.length}`);
        
    } catch (error) {
        console.error('❌ Error updating dictionary:', error);
        process.exit(1);
    }
}

// Run the update
updateDictionary();