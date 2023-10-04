// vite.config.ts
import { run } from "file:///home/alan/code/witchcraft-js/editor/node_modules/.pnpm/@alanscodelog+utils@4.0.0-beta.11/node_modules/@alanscodelog/utils/dist/index_node.js";
import vue from "file:///home/alan/code/witchcraft-js/editor/node_modules/.pnpm/@vitejs+plugin-vue@4.3.4_vite@4.4.9_vue@3.3.4/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { externalizeDeps } from "file:///home/alan/code/witchcraft-js/editor/node_modules/.pnpm/vite-plugin-externalize-deps@0.7.0_vite@4.4.9/node_modules/vite-plugin-externalize-deps/dist/index.js";
import tsconfigPaths from "file:///home/alan/code/witchcraft-js/editor/node_modules/.pnpm/vite-tsconfig-paths@4.2.0_typescript@5.2.2_vite@4.4.9/node_modules/vite-tsconfig-paths/dist/index.mjs";
import { defineConfig } from "file:///home/alan/code/witchcraft-js/editor/node_modules/.pnpm/vitest@0.33.0_sass@1.66.1/node_modules/vitest/dist/config.js";

// postcss.config.js
import autoprefixer from "file:///home/alan/code/witchcraft-js/editor/node_modules/.pnpm/autoprefixer@10.4.15_postcss@8.4.29/node_modules/autoprefixer/lib/autoprefixer.js";
import postCssComment from "file:///home/alan/code/witchcraft-js/editor/node_modules/.pnpm/postcss-comment@2.0.0/node_modules/postcss-comment/index.js";
import postCssImport from "file:///home/alan/code/witchcraft-js/editor/node_modules/.pnpm/postcss-import@15.1.0_postcss@8.4.29/node_modules/postcss-import/index.js";
import tailwind from "file:///home/alan/code/witchcraft-js/editor/node_modules/.pnpm/tailwindcss@3.3.3_ts-node@10.9.1/node_modules/tailwindcss/lib/index.js";
import nesting from "file:///home/alan/code/witchcraft-js/editor/node_modules/.pnpm/tailwindcss@3.3.3_ts-node@10.9.1/node_modules/tailwindcss/nesting/index.js";

// tailwind.config.js
import { config } from "file:///home/alan/code/@alanscodelog/vue-components/dist/tailwind/config.js";
var tailwind_config_default = {
  ...config,
  content: [
    ...config.content,
    "./index.html",
    "./src/**/*.vue",
    "./node_modules/@alanscodelog/vue-components/src/**/*.vue"
  ],
  plugins: [
    ...config.plugins
  ]
};

// postcss.config.js
var postcss_config_default = {
  parser: postCssComment,
  plugins: [
    postCssImport,
    nesting,
    tailwind(tailwind_config_default),
    autoprefixer
  ]
};

// vite.config.ts
console.log(postcss_config_default);
var typesPlugin = () => ({
  name: "typesPlugin",
  // eslint-disable-next-line no-console
  writeBundle: async () => run(`npm run build:types`).promise.catch((e) => {
    console.log(e.stdout);
    process.exit(1);
  }).then(() => void 0)
});
var vite_config_default = async ({ mode }) => defineConfig({
  plugins: [
    vue(),
    // it isn't enough to just pass the deps list to rollup.external since it will not exclude subpath exports
    externalizeDeps(),
    // even if we don't use aliases, this is needed to get imports based on baseUrl working
    tsconfigPaths(),
    // runs build:types script which takes care of generating types and fixing type aliases and baseUrl imports
    typesPlugin()
  ],
  build: {
    ...mode === "production" ? {
      // if this is an app
      minify: true
    } : {
      minify: false,
      sourcemap: "inline"
    }
  },
  test: {
    cache: process.env.CI ? false : void 0
  },
  resolve: {
    alias: []
  },
  css: {
    postcss: postcss_config_default
  },
  server: {
    // for locally linked repos when using vite server (i.e. not needed for libraries)
    fs: {
      allow: [...process.env.CODE_PROJECTS ?? []]
    },
    watch: {
      // for pnpm
      followSymlinks: true,
      // watch changes in linked repos
      ignored: ["!**/node_modules/@alanscodelog/**"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicG9zdGNzcy5jb25maWcuanMiLCAidGFpbHdpbmQuY29uZmlnLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvYWxhbi9jb2RlL3dpdGNoY3JhZnQtanMvZWRpdG9yXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9hbGFuL2NvZGUvd2l0Y2hjcmFmdC1qcy9lZGl0b3Ivdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvYWxhbi9jb2RlL3dpdGNoY3JhZnQtanMvZWRpdG9yL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgcnVuIH0gZnJvbSBcIkBhbGFuc2NvZGVsb2cvdXRpbHMvbm9kZVwiXG5pbXBvcnQgdnVlIGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWVcIlxuaW1wb3J0IHR5cGUgeyBQbHVnaW5PcHRpb24gfSBmcm9tIFwidml0ZVwiXG5pbXBvcnQgeyBleHRlcm5hbGl6ZURlcHMgfSBmcm9tIFwidml0ZS1wbHVnaW4tZXh0ZXJuYWxpemUtZGVwc1wiXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXN0L2NvbmZpZ1wiXG5cbmltcG9ydCBwb3N0Y3NzIGZyb20gXCIuL3Bvc3Rjc3MuY29uZmlnXCJcblxuXG5jb25zb2xlLmxvZyhwb3N0Y3NzKVxuXG5cbmNvbnN0IHR5cGVzUGx1Z2luID0gKCk6IFBsdWdpbk9wdGlvbiA9PiAoe1xuXHRuYW1lOiBcInR5cGVzUGx1Z2luXCIsXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG5cdHdyaXRlQnVuZGxlOiBhc3luYyAoKSA9PiBydW4oYG5wbSBydW4gYnVpbGQ6dHlwZXNgKS5wcm9taXNlLmNhdGNoKGUgPT4geyBjb25zb2xlLmxvZyhlLnN0ZG91dCk7IHByb2Nlc3MuZXhpdCgxKSB9KS50aGVuKCgpID0+IHVuZGVmaW5lZCksXG59KVxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHsgbW9kZSB9OiB7IG1vZGU6IHN0cmluZyB9KSA9PiBkZWZpbmVDb25maWcoe1xuXHRwbHVnaW5zOiBbXG5cdFx0dnVlKCksXG5cdFx0Ly8gaXQgaXNuJ3QgZW5vdWdoIHRvIGp1c3QgcGFzcyB0aGUgZGVwcyBsaXN0IHRvIHJvbGx1cC5leHRlcm5hbCBzaW5jZSBpdCB3aWxsIG5vdCBleGNsdWRlIHN1YnBhdGggZXhwb3J0c1xuXHRcdGV4dGVybmFsaXplRGVwcygpLFxuXHRcdC8vIGV2ZW4gaWYgd2UgZG9uJ3QgdXNlIGFsaWFzZXMsIHRoaXMgaXMgbmVlZGVkIHRvIGdldCBpbXBvcnRzIGJhc2VkIG9uIGJhc2VVcmwgd29ya2luZ1xuXHRcdHRzY29uZmlnUGF0aHMoKSxcblx0XHQvLyBydW5zIGJ1aWxkOnR5cGVzIHNjcmlwdCB3aGljaCB0YWtlcyBjYXJlIG9mIGdlbmVyYXRpbmcgdHlwZXMgYW5kIGZpeGluZyB0eXBlIGFsaWFzZXMgYW5kIGJhc2VVcmwgaW1wb3J0c1xuXHRcdHR5cGVzUGx1Z2luKCksXG5cdF0sXG5cdGJ1aWxkOiB7XG5cdFx0Li4uKG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8ge1xuXHRcdFx0Ly8gaWYgdGhpcyBpcyBhbiBhcHBcblx0XHRcdG1pbmlmeTogdHJ1ZSxcblx0XHR9IDoge1xuXHRcdFx0bWluaWZ5OiBmYWxzZSxcblx0XHRcdHNvdXJjZW1hcDogXCJpbmxpbmVcIixcblx0XHR9KSxcblx0fSxcblx0dGVzdDoge1xuXHRcdGNhY2hlOiBwcm9jZXNzLmVudi5DSSA/IGZhbHNlIDogdW5kZWZpbmVkLFxuXHR9LFxuXHRyZXNvbHZlOiB7XG5cdFx0YWxpYXM6IFtcblx0XHRdLFxuXHR9LFxuXHRjc3M6IHtcblx0XHRwb3N0Y3NzLFxuXHR9LFxuXHRzZXJ2ZXI6IHtcblx0XHQvLyBmb3IgbG9jYWxseSBsaW5rZWQgcmVwb3Mgd2hlbiB1c2luZyB2aXRlIHNlcnZlciAoaS5lLiBub3QgbmVlZGVkIGZvciBsaWJyYXJpZXMpXG5cdFx0ZnM6IHtcblx0XHRcdGFsbG93OiBbLi4uKHByb2Nlc3MuZW52LkNPREVfUFJPSkVDVFMgPz8gW10pIV0sXG5cdFx0fSxcblx0XHR3YXRjaDoge1xuXHRcdFx0Ly8gZm9yIHBucG1cblx0XHRcdGZvbGxvd1N5bWxpbmtzOiB0cnVlLFxuXHRcdFx0Ly8gd2F0Y2ggY2hhbmdlcyBpbiBsaW5rZWQgcmVwb3Ncblx0XHRcdGlnbm9yZWQ6IFtcIiEqKi9ub2RlX21vZHVsZXMvQGFsYW5zY29kZWxvZy8qKlwiXSxcblx0XHR9LFxuXHR9LFxufSlcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvYWxhbi9jb2RlL3dpdGNoY3JhZnQtanMvZWRpdG9yXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9hbGFuL2NvZGUvd2l0Y2hjcmFmdC1qcy9lZGl0b3IvcG9zdGNzcy5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvYWxhbi9jb2RlL3dpdGNoY3JhZnQtanMvZWRpdG9yL3Bvc3Rjc3MuY29uZmlnLmpzXCI7aW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tIFwiYXV0b3ByZWZpeGVyXCJcbmltcG9ydCBwb3N0Q3NzQ29tbWVudCBmcm9tIFwicG9zdGNzcy1jb21tZW50XCJcbmltcG9ydCBwb3N0Q3NzSW1wb3J0IGZyb20gXCJwb3N0Y3NzLWltcG9ydFwiXG5pbXBvcnQgdGFpbHdpbmQgZnJvbSBcInRhaWx3aW5kY3NzXCJcbmltcG9ydCBuZXN0aW5nIGZyb20gXCJ0YWlsd2luZGNzcy9uZXN0aW5nXCJcblxuaW1wb3J0IHRhaWx3aW5kQ29uZmlnIGZyb20gXCIuL3RhaWx3aW5kLmNvbmZpZy5qc1wiXG5cblxuZXhwb3J0IGRlZmF1bHQge1xuXHRwYXJzZXI6IHBvc3RDc3NDb21tZW50LFxuXHRwbHVnaW5zOiBbXG5cdFx0cG9zdENzc0ltcG9ydCxcblx0XHRuZXN0aW5nLFxuXHRcdHRhaWx3aW5kKHRhaWx3aW5kQ29uZmlnKSxcblx0XHRhdXRvcHJlZml4ZXIsXG5cdF0sXG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL2FsYW4vY29kZS93aXRjaGNyYWZ0LWpzL2VkaXRvclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvYWxhbi9jb2RlL3dpdGNoY3JhZnQtanMvZWRpdG9yL3RhaWx3aW5kLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9hbGFuL2NvZGUvd2l0Y2hjcmFmdC1qcy9lZGl0b3IvdGFpbHdpbmQuY29uZmlnLmpzXCI7Ly8gaW1wb3J0IGNvbXBvbmVudHNjb25maWcgZnJvbSBcIkBhbGFuc2NvZGVsb2cvdnVlLWNvbXBvbmVudHMvdGFpbHdpbmQuY29uZmlnLnRzXCJcbi8vIGltcG9ydCB7IHBsdWdpbiBhcyBsaWJyYXJ5UGx1Z2luIH0gZnJvbSBcIkBhbGFuc2NvZGVsb2cvdnVlLWNvbXBvbmVudHMvdGFpbHdpbmQvcGx1Z2luLmpzXCJcbi8vXG4vLyAvKiogQHR5cGUge2ltcG9ydCgndGFpbHdpbmRjc3MnKS5Db25maWd9ICovXG4vLyBjb25zdCBjb25maWcgPSB7XG4vLyBcdC4uLmNvbXBvbmVudHNjb25maWcsXG4vLyBjb250ZW50OiBbXG4vLyBcdFx0Li4uY29tcG9uZW50c2NvbmZpZy5jb250ZW50LFxuLy8gXHRcdFwiLi9pbmRleC5odG1sXCIsXG4vLyBcdFx0XCIuL3NyYy8qKi8qLnZ1ZVwiLFxuLy8gXHRcdFwiLi9ub2RlX21vZHVsZXMvQGFsYW5zY29kZWxvZy92dWUtY29tcG9uZW50cy9zcmMvKiovKi52dWVcIixcbi8vIFx0XSxcbi8vIFx0ZGFya01vZGU6IFwiY2xhc3NcIixcbi8vIFx0cGx1Z2luczogW1xuLy8gXHRcdGxpYnJhcnlQbHVnaW4sXG4vLyBcdF0sXG4vLyB9XG4vL1xuLy8gZXhwb3J0IGRlZmF1bHQgY29uZmlnXG5cbmltcG9ydCB7IGNvbmZpZyB9IGZyb20gXCJAYWxhbnNjb2RlbG9nL3Z1ZS1jb21wb25lbnRzL3RhaWx3aW5kL2NvbmZpZy5qc1wiXG4vLyBpbXBvcnQgdGFpbHdpbmRQbHVnaW4gZnJvbSBcInRhaWx3aW5kY3NzL3BsdWdpbi5qc1wiXG5cblxuZXhwb3J0IGRlZmF1bHQge1xuXHQuLi5jb25maWcsXG5cdGNvbnRlbnQ6IFtcblx0XHQuLi5jb25maWcuY29udGVudCxcblx0XHRcIi4vaW5kZXguaHRtbFwiLFxuXHRcdFwiLi9zcmMvKiovKi52dWVcIixcblx0XHRcIi4vbm9kZV9tb2R1bGVzL0BhbGFuc2NvZGVsb2cvdnVlLWNvbXBvbmVudHMvc3JjLyoqLyoudnVlXCIsXG5cdF0sXG5cdHBsdWdpbnM6IFtcblx0XHQuLi5jb25maWcucGx1Z2lucyxcblxuXHRdLFxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4UixTQUFTLFdBQVc7QUFDbFQsT0FBTyxTQUFTO0FBRWhCLFNBQVMsdUJBQXVCO0FBQ2hDLE9BQU8sbUJBQW1CO0FBQzFCLFNBQVMsb0JBQW9COzs7QUNMdVEsT0FBTyxrQkFBa0I7QUFDN1QsT0FBTyxvQkFBb0I7QUFDM0IsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxjQUFjO0FBQ3JCLE9BQU8sYUFBYTs7O0FDZ0JwQixTQUFTLGNBQWM7QUFJdkIsSUFBTywwQkFBUTtBQUFBLEVBQ2QsR0FBRztBQUFBLEVBQ0gsU0FBUztBQUFBLElBQ1IsR0FBRyxPQUFPO0FBQUEsSUFDVjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsR0FBRyxPQUFPO0FBQUEsRUFFWDtBQUNEOzs7QUQzQkEsSUFBTyx5QkFBUTtBQUFBLEVBQ2QsUUFBUTtBQUFBLEVBQ1IsU0FBUztBQUFBLElBQ1I7QUFBQSxJQUNBO0FBQUEsSUFDQSxTQUFTLHVCQUFjO0FBQUEsSUFDdkI7QUFBQSxFQUNEO0FBQ0Q7OztBRFBBLFFBQVEsSUFBSSxzQkFBTztBQUduQixJQUFNLGNBQWMsT0FBcUI7QUFBQSxFQUN4QyxNQUFNO0FBQUE7QUFBQSxFQUVOLGFBQWEsWUFBWSxJQUFJLHFCQUFxQixFQUFFLFFBQVEsTUFBTSxPQUFLO0FBQUUsWUFBUSxJQUFJLEVBQUUsTUFBTTtBQUFHLFlBQVEsS0FBSyxDQUFDO0FBQUEsRUFBRSxDQUFDLEVBQUUsS0FBSyxNQUFNLE1BQVM7QUFDeEk7QUFHQSxJQUFPLHNCQUFRLE9BQU8sRUFBRSxLQUFLLE1BQXdCLGFBQWE7QUFBQSxFQUNqRSxTQUFTO0FBQUEsSUFDUixJQUFJO0FBQUE7QUFBQSxJQUVKLGdCQUFnQjtBQUFBO0FBQUEsSUFFaEIsY0FBYztBQUFBO0FBQUEsSUFFZCxZQUFZO0FBQUEsRUFDYjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ04sR0FBSSxTQUFTLGVBQWU7QUFBQTtBQUFBLE1BRTNCLFFBQVE7QUFBQSxJQUNULElBQUk7QUFBQSxNQUNILFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxJQUNaO0FBQUEsRUFDRDtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0wsT0FBTyxRQUFRLElBQUksS0FBSyxRQUFRO0FBQUEsRUFDakM7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNSLE9BQU8sQ0FDUDtBQUFBLEVBQ0Q7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNKO0FBQUEsRUFDRDtBQUFBLEVBQ0EsUUFBUTtBQUFBO0FBQUEsSUFFUCxJQUFJO0FBQUEsTUFDSCxPQUFPLENBQUMsR0FBSSxRQUFRLElBQUksaUJBQWlCLENBQUMsQ0FBRztBQUFBLElBQzlDO0FBQUEsSUFDQSxPQUFPO0FBQUE7QUFBQSxNQUVOLGdCQUFnQjtBQUFBO0FBQUEsTUFFaEIsU0FBUyxDQUFDLG1DQUFtQztBQUFBLElBQzlDO0FBQUEsRUFDRDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
