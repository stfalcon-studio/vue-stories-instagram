import commonjs from '@rollup/plugin-commonjs';
import vue from 'rollup-plugin-vue';
import buble from '@rollup/plugin-buble';

export default {
    input: 'src/install.js',
    output: {
        name: 'Stories',
        exports: 'named'
    },
    plugins: [
        commonjs(),
        vue({
            css: true,
            compileTemplate: true,
        }),
        buble()
    ],
};