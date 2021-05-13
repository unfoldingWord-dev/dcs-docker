const {Octokit} = require('@octokit/rest');
const request = require('superagent');
const {default: PQueue} = require('p-queue');


async function getFromGiteaRepositories(fromGiteaUrl, username, token) {
  const octokit = new Octokit({
    baseUrl: fromGiteaUrl + '/api/v1',
    auth: token || null,
  });
  return octokit.paginate('GET /users/:username/repos', { username: username })
    .then(repositories => toRepositoryList(repositories));
}

function toRepositoryList(repositories) {
  return repositories.map(repository => {
    return { name: repository.name, url: repository.clone_url }
  });
}

async function getGiteaUser(props) {
  return request.get(props.url
    + '/api/v1/user')
    .query(`access_token=${props.token}`)
    .then(response => {
      return { id: response.body.id, name: response.body.username }
    });
}

async function isAlreadyOnGitea(repository, props) {
  const requestUrl = `${props.url}/api/v1/repos/${props.repo_owner}/${repository}`;
  console.log("Checking if exists: "+props.repo_owner+"/"+repository);
  return request.get(
    requestUrl)
    .query(`access_token=${props.token}`)
    .then(() => {
      console.log(repository+" exists");
      return true;
    })
    .catch(() => {
      console.log(repository+" no exist");
      return false;
    });
}

async function migrateToGitea(repository, props) {
  return await request.post(`${props.url}/api/v1/repos/migrate`).query(`access_token=${props.token}`).send({
    clone_addr: repository.url,
    mirror: props.mirror,
    repo_name: repository.name,
    repo_owner: props.repo_owner,
  });
}

async function migrate(repository, props) {
  if (await isAlreadyOnGitea(repository.name, props)) {
    console.log('Repository is already migrated; doing nothing: '+props.repo_owner+'/'+repository.name);
    // Migrate to temp repo, delete orig repo and move temp repo here
    return;
  }
  console.log('Migrating repository to gitea: '+props.repo_owner+'/'+repository.name);
  const result = await migrateToGitea(repository, props);
  console.log("Result: ", result)
}

async function main() {
  const fromGiteaUsername = process.env.FROM_GITEA_USERNAME;
  if (!fromGiteaUsername) {
    console.error('No FROM_GITEA_USERNAME specified, please specify! Exiting..');
    return;
  }
  const fromGiteaToken = process.env.FROM_GITEA_TOKEN;
  const fromGiteaUrl = process.env.FROM_GITEA_URL;
  if (!fromGiteaUrl) {
    console.error('No FROM_GITEA_URL specified, please specify! Exiting..')
  }
  const toGiteaUrl = process.env.TO_GITEA_URL;
  if (!toGiteaUrl) {
    console.error('No TO_GITEA_URL specified, please specify! Exiting..');
    return;
  }

  const toGiteaToken = process.env.TO_GITEA_TOKEN;
  if (!toGiteaToken) {
    console.error('No TO_GITEA_TOKEN specified, please specify! Exiting..');
    return;
  }

  const fromGiteaRepositories = await getFromGiteaRepositories(fromGiteaUrl, fromGiteaUsername, fromGiteaToken);
  console.log(`Found ${fromGiteaRepositories.length} repositories on orig gitea`);

  const mirror = process.env.MIRROR || false;
  const keep_synced = !mirror && (process.env.KEEP_SYNCED || false);

  const props = {
    url: toGiteaUrl,
    token: toGiteaToken,
    mirror: mirror,
    keep_synced: keep_synced,
    repo_owner: process.env.TO_GITEA_USERNAME || fromGiteaUsername
  };

  const queue = new PQueue({ concurrency: 4 });
  const newArr = [];
  fromGiteaRepositories.forEach(repository => {
    if (repository.name.startsWith('en_')) {
      newArr.push(repository);
    } 
  });
  await queue.addAll(newArr.map(repository => {
    return async () => {
      console.log("MIGRATING "+fromGiteaUrl+"/"+fromGiteaUsername+"/"+repository.name+" TO  "+props.url+"/"+props.repo_owner+"/"+repository.name+"...");
      await migrate(repository, props);
    };
  }));
}

main();
