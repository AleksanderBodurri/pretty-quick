# `pretty-quick-extended`
   Provides various extensions to the pretty-quick package developed by Lucas Azzola. All credit to the original author https://github.com/azz

# Install and Setup Config

`npm install --save-dev prettier pretty-quick-extended`

Create a `pqx-config.js` file in your root directory.

### Supported Options: 
 - REGEX_TO_READABLE_MAPPINGS: Map a regular expression to readable string. `pretty-quick-extended` will automatically sort import statements in javascript/typescript that match the given regex under the readable label

### Example Config
```js
module.exports =  {
  REGEX_TO_READABLE_MAPPINGS: [
    ['^@angular((?!material).)*$', 'Angular'], // Map '@angular/<path>' to 'Angular'
    ['^@angular\/material.*', 'Material'],  // Map '@angular/material<path>' to 'Material'
    ['\.component$', 'Components']  // Map '<path>.component' to 'Components'
  ].map(([regexString, readableLabel]) => [new RegExp(regexString), readableLabel])
};
```
If an import doesn't match any regex in the config it will be grouped by its module name.

## Setup Pre-commit Hook

In `package.json`:

```
"husky": {
  "hooks": {
    "pre-commit": "pretty-quick-extended --staged"
  }
}
```
## Example Use Case

### before commit (ugly imports)
```ts
import {NgModule} from
 '@angular/core';
import {HeaderComponent} from './header/header.component';
import {
CommonModule
} from '@angular/common';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {
MatInputModule} from '@angular/material/input';
import {RouterModule} from '@angular/router';
import {MatChipsModule
} from '@angular/material/chips';
import {something} from 'some-other-module';
```

### after commit (imports grouped and formatted)
```ts
// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components
import { HeaderComponent } from './header/header.component';

// Material
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';

// some-other-module
import { something } from 'some-other-module';
```

See [Pretty Quick README](https://github.com/azz/pretty-quick/blob/master/README.md) for additional information on `pretty-quick` usage.
