import * as cdn from "@pulumi/azure-native/cdn";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as pulumi from "@pulumi/pulumi";

function shortStackIdentifier(str: string): string {
    const stack = str.toLowerCase();
    if (stack == 'production') {
        return 'Prd'
    }
    if (stack == 'staging') {
        return 'Stg'
    }
    throw new Error(`Stack name '${stack}' not recognised.`);
}

const identifier = `DemoStaticWeb${shortStackIdentifier(pulumi.getStack())}`
const storageAccIdnetifier = `DemoStatWeb${shortStackIdentifier(pulumi.getStack())}`.toLowerCase();

const resourceGroup = new resources.ResourceGroup(identifier);

const profile = new cdn.Profile(identifier, {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: cdn.SkuName.Standard_Microsoft,
    },
});

const storageAccount = new storage.StorageAccount(storageAccIdnetifier, {
    enableHttpsTrafficOnly: true,
    kind: storage.Kind.StorageV2,
    resourceGroupName: resourceGroup.name,
    sku: {
        name: storage.SkuName.Standard_LRS,
    },
});

// Enable static website support
const staticWebsite = new storage.StorageAccountStaticWebsite(identifier, {
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    indexDocument: "index.html",
    error404Document: "404.html",
});

// Upload the files
["index.html", "404.html"].map(name =>
    new storage.Blob(name, {
        resourceGroupName: resourceGroup.name,
        accountName: storageAccount.name,
        containerName: staticWebsite.containerName,
        source: new pulumi.asset.FileAsset(`./public/${name}`),
        contentType: "text/html",
    }),
);

// Web endpoint to the website
export const staticEndpoint = storageAccount.primaryEndpoints.web;

// Optionally, add a CDN.
const endpointOrigin = storageAccount.primaryEndpoints.apply(ep => ep.web.replace("https://", "").replace("/", ""));
const endpoint = new cdn.Endpoint(identifier, {
    endpointName: storageAccount.name.apply(sa => `CdnEndpoint${sa}`),
    isHttpAllowed: false,
    isHttpsAllowed: true,
    originHostHeader: endpointOrigin,
    origins: [{
        hostName: endpointOrigin,
        httpsPort: 443,
        name: "origin-storage-account",
    }],
    profileName: profile.name,
    queryStringCachingBehavior: cdn.QueryStringCachingBehavior.NotSet,
    resourceGroupName: resourceGroup.name,
});

// CDN endpoint to the website.
// Allow it some time after the deployment to get ready.
export const cdnEndpoint = pulumi.interpolate`https://${endpoint.hostName}/`;
