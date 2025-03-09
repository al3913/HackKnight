// Format the response text with proper line breaks and indentation
export const formatResponse = (text) => {
    // Split by line breaks and remove empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    // Process each line
    return lines.map(line => {
        // Add indentation for lists
        if (line.trim().startsWith('-') || line.trim().match(/^\d+\./)) {
            return '    ' + line;
        }
        return line;
    }).join('\n');
}; 