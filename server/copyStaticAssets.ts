import * as shell from 'shelljs';

shell.rm('-rf', 'dist/public/');
shell.cp('-R', 'src/public/', 'dist/public/');

try {
    shell.rm('-rf', '../../wow-auction-helper-serverless/dist/');
    shell.cp('-R', './dist/', '../../wow-auction-helper-serverless/dist/');
} catch (error) {
    console.log('Copy to lambda folder failed');
}
