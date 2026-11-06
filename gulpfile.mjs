import minimist from 'minimist';
import gulp from 'gulp';
import 'colors';
import RestAPI from './api/api.mjs'
import * as fs from "node:fs";
import 'dotenv/config';
import mustache from "mustache";
import {CloudFrontClient, CreateInvalidationCommand} from "@aws-sdk/client-cloudfront";
import https from "https"; // ES Modules import
import path from "path";

/**
 * Gulpfile for building sitemap and index.html in React public folder.
 * Import this into a stub gulpfile at your project root.
 */

const args = minimist(process.argv.slice(2));

gulp.task("buildSitemap", async function () {
  const restApi = new RestAPI(
    parseInt(process.env.REACT_APP_SITE_ID),
    process.env.REACT_APP_BACKEND_HOST,
    process.env.REACT_APP_API_KEY
  );
  const sitemap = await restApi.getSitemap();
  fs.writeFileSync(`./public/sitemap.xml`, sitemap);
  console.log(`Site map:\n\n${sitemap}`.green);
});

gulp.task("buildIndex", async function () {
  const restApi = new RestAPI(
    parseInt(process.env.REACT_APP_SITE_ID),
    process.env.REACT_APP_BACKEND_HOST,
    process.env.REACT_APP_API_KEY
  );
  const site = await restApi.getSite();
  const outline = await restApi.getSiteOutline();
  const template = fs.readFileSync('src/framework/index_template.html', 'utf8');
  let index;
  if (outline.length > 0) {
    const page = await restApi.getPage(outline[0].PageID);
    index = mustache.render(template, {
      ...page,
      title: page.PageMetaTitle ? page.PageMetaTitle : page.PageTitle,
      SiteStyle: site.SiteStyle,
      SiteTheme: site.SiteTheme,
      Robots: site.NoIndex ? 'none' : 'index,follow',
    })
  } else {
    index = mustache.render(template, {
      title: site.SiteName,
      SiteStyle: site.SiteStyle,
      SiteTheme: site.SiteTheme,
      Robots: site.NoIndex ? 'none' : 'index,follow',
    })
  }
  fs.writeFileSync(`./public/index.html`, index);
  console.log(`index.html generated.`.green);
});

gulp.task("createInvalidation", async function () {
  console.log(`Creating CloudFront invalidation...`);
  const config = {}; // type is CloudFrontClientConfig
  const client = new CloudFrontClient(config);
  const input = { // CreateInvalidationRequest
    DistributionId: process.env.REACT_APP_CLOUDFRONT_DISTRIBUTION_ID, // required
    InvalidationBatch: { // InvalidationBatch
      Paths: { // Paths
        Quantity: Number(1), // required
        Items: [ // PathList
          "/*",
        ],
      },
      CallerReference: Date.now().toString(), // required
    },
  };
  const command = new CreateInvalidationCommand(input);
  const response = await client.send(command);
  console.log(`Response: ${JSON.stringify(response)}`.green);
});


gulp.task("injectCss", async function () {
  const restApi = new RestAPI(
    parseInt(process.env.REACT_APP_SITE_ID),
    process.env.REACT_APP_BACKEND_HOST,
    process.env.REACT_APP_API_KEY
  );
  const cssUrl = 'https://resources.h2rover.net/css/';
  const htmlPath = './build/index.html';
  const siteConfig = await restApi.getSite();
  https.get(`${cssUrl}${siteConfig.SiteStyle}`, (res) => {
    let css = '';
    res.on('data', chunk => css += chunk);
    res.on('end', () => {
      if (fs.existsSync(htmlPath)) {
        let html = fs.readFileSync(htmlPath, 'utf8');
        html = html.replace('</head>', `<style>${css}</style></head>`);
        fs.writeFileSync(htmlPath, html);
        console.log('External CSS inlined into build/index.html');
      }
    });
  });
});