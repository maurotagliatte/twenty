export const META_GRAPH_API_VERSION = 'v23.0';

export const META_GRAPH_API_BASE_URL = `https://graph.facebook.com/${META_GRAPH_API_VERSION}`;

export const META_OAUTH_DIALOG_URL = `https://www.facebook.com/${META_GRAPH_API_VERSION}/dialog/oauth`;

export const META_OAUTH_SCOPES = [
  'public_profile',
  'business_management',
  'pages_show_list',
  'pages_read_engagement',
  'instagram_basic',
  'instagram_manage_insights',
  'whatsapp_business_management',
  'whatsapp_business_messaging',
];
