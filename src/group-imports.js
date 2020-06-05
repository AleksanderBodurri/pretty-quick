import {join} from "path";
const fs = require("fs");
const IMPORT_REGEX = /import\s+?(?:(?:(?:[\w*\s{},]*)\s+from\s+?)|)(?:(?:".*?")|(?:'.*?'))[\s]*?(?:;|$|)(\r\n|\r|\n)/g
const PATH_REGEX = /'.*'/;
const REGEX_INDEX = 0;
const READABLE_LABEL_INDEX = 1;
const CONFIG_FILE_NAME = 'pqx-config.js'
let mappings;

const entryPoint = (directoryPath, relativePath) => {
    const FILE_PATH = join(directoryPath, relativePath);
    const config = require(`${directoryPath}/${CONFIG_FILE_NAME}`);
    mappings = config['REGEX_TO_READABLE_MAPPINGS'] || [];

    const fileAsString = fs.readFileSync(FILE_PATH).toString();
    const matches = fileAsString.matchAll(IMPORT_REGEX);
    const allImports = [];

    for (const match of matches) {
        allImports.push(match[0].replace(/"/g, `'`));
    }

    const uniqueModuleNames = getUniqueModuleNames(allImports);
    const groupedImports = groupImports(uniqueModuleNames, allImports);
    const groupedImportLines = createGroupedImportLines(groupedImports);
    writeToFile(groupedImportLines, uniqueModuleNames, FILE_PATH);
}

module.exports = entryPoint;

const getUniqueModuleNames = (allImports) => {
    return [...new Set(allImports.map(fileImport => {
        const path = fileImport.match(PATH_REGEX)[0].replace(/'/g, '');
        const foundMapping = mappings.find(mapping => mapping[REGEX_INDEX].test(path));
        if (foundMapping) {
            return foundMapping[READABLE_LABEL_INDEX]
        }
        return path;
    }))].sort();
}

const groupImports = (uniqueModuleNames, allImports) => {
    return uniqueModuleNames.map(moduleName => {
        const foundMapping = mappings.find(mapping => mapping[READABLE_LABEL_INDEX] === moduleName);
        if (foundMapping) {
            return allImports.map(fileImport => {
                const path = fileImport.match(PATH_REGEX)[0].replace(/'/g, '');
                const pathMatch = foundMapping[REGEX_INDEX].test(path);
                return pathMatch ? { importString: fileImport, readableLabel: moduleName } : null
            }).filter(Boolean);
        }
        return allImports.map(fileImport => {
            const path = fileImport.match(PATH_REGEX)[0].replace(/'/g, '');
            const pathMatch = path === moduleName;
            return pathMatch ? { importString: fileImport, readableLabel: moduleName } : null
        }).filter(Boolean);
    });
}

const createGroupedImportLines = (groupedImports) => {
    const groupedLines = [];
    groupedImports.forEach(group => {
        const newGroupIndex = groupedLines.push(group.map(importData => importData.importString)) - 1;
        groupedLines[newGroupIndex].unshift(`// ${group[0].readableLabel}\n`);
    });
    return groupedLines;
}

const writeToFile = (groupedImportLines, uniqueModuleNames, FILE_PATH) => {
    let data = fs.readFileSync(FILE_PATH).toString();
    let fd = fs.openSync(FILE_PATH, 'w+');
    const groupsAsString = groupedImportLines.map(group => group.join('')).join('\n');
    uniqueModuleNames.forEach(moduleName => {
        data = data.replace(new RegExp(`\/\/ ${moduleName}\n`), '');
    })
    const dataWithoutOldImports = data.replace(IMPORT_REGEX, '').replace(/^\n*/g, '');
    const buffer = Buffer.from(groupsAsString + '\n' + dataWithoutOldImports);
    fs.writeSync(fd, buffer, 0, buffer.length, 0);
    fs.closeSync(fd);
}
