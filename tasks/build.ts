import * as fs from 'fs';

const file = fs.readFileSync('./package.json', {encoding: 'utf8'})

const oldPackage = JSON.parse(file)

let newPubPackage: any = {}

newPubPackage['name'] = oldPackage['name']
newPubPackage['version'] = oldPackage['version']
newPubPackage['description'] = oldPackage['description']
newPubPackage['author'] = oldPackage['author']
newPubPackage['homepage'] = oldPackage['homepage']
newPubPackage['bugs'] = oldPackage['bugs']
newPubPackage['repository'] = oldPackage['repository']
newPubPackage['license'] = oldPackage['license']
newPubPackage['keywords'] = oldPackage['keywords']
newPubPackage['peerDependencies'] = oldPackage['peerDependencies']

fs.writeFileSync('./lib/package.json', JSON.stringify(newPubPackage), {encoding: 'utf8'})
