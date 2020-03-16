// Lets remove any browser specific style
import 'minireset.css/minireset.min.css';

import React from 'react';
import ReactDOM from 'react-dom';
import Root from './Root';

const rootEl = document.createElement('div');
document.body.appendChild(rootEl);

ReactDOM.render(<Root />, rootEl);
