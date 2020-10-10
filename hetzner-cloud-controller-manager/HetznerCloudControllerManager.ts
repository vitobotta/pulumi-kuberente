import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'

export interface HetznerCloudControllerManagerArgs {
  apiToken?: pulumi.Input<string>,
  // version?: pulumi.Input<string>,
  network?: pulumi.Input<string>,
}

export class HetznerCloudControllerManager extends pulumi.ComponentResource  {
  constructor(
    appName: string,
    args: HetznerCloudControllerManagerArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super(appName, appName, {}, opts)

    const config: pulumi.Config = new pulumi.Config(appName)

    const apiToken = pulumi.output(args.apiToken || config.getSecret('apiToken') || "blah")
    // const version = args.version || "v1.8.0"
    const network = args.network || "default"

    // const manifestURL = `https://raw.githubusercontent.com/hetznercloud/hcloud-cloud-controller-manager/master/deploy/${version}-networks.yaml`;
    const manifestURL = `https://raw.githubusercontent.com/hetznercloud/hcloud-cloud-controller-manager/master/deploy/ccm-networks.yaml`;

    const secret = new k8s.core.v1.Secret(`${appName}-hetzner-cloud-token`, 
      {
        metadata: {
          name: "hcloud",
          namespace: "kube-system",
        },
        stringData: {
          token: apiToken,
          network: network
        },
      },
      {
        parent: this,
      },      
    )    

    const manifest = new k8s.yaml.ConfigFile(
      `${appName}-manifest`,
      {
        file: manifestURL,
      },
      {
        parent: this,
        dependsOn: [
          secret,
        ],
      },
    )       
  }
}