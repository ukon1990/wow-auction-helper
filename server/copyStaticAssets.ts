import * as shell from 'shelljs';

shell.rm('-rf', 'dist/public/');
shell.cp('-R', 'src/public/', 'dist/public/');
