import { execSync } from 'node:child_process'

// Git utils

function getLocalRepoUrl() {
    const topLevelDir = execSync( 'git rev-parse --show-toplevel' )
        .toString()
        .trim()

    return `file://${ topLevelDir }/.git`
}

function getCurrentBranch() {
    return execSync( 'git rev-parse --abbrev-ref HEAD' )
        .toString()
        .trim()
}

// Plugins sub-configs

function getGitmojiPlugin() {
    return [
        'semantic-release-gitmoji', {
            'releaseRules': {
                'major': [
                    ':boom:'
                ],
                'minor': [
                    ':sparkles:'
                ],
                'patch': [
                    ':art:', ':zap:', ':fire:', ':bug:', ':ambulance:', ':pencil:', ':rocket:', ':lipstick:', ':white_check_mark:', ':lock:', ':apple:', ':penguin:', ':checkered_flag:', ':robot:',
                    ':green_apple:', ':rotating_light:', ':green_heart:', ':arrow_down:', ':pushpin:', ':construction_worker:', ':chart_with_upwards_trend:', ':recycle:', ':whale:',
                    ':heavy_plus_sign:', ':heavy_minus_sign:', ':wrench:', ':globe_with_meridians:', ':pencil2:', ':poop:', ':rewind:', ':package:', ':alien:', ':truck:', ':page_facing_up:',
                    ':bento:', ':ok_hand:', ':wheelchair:', ':bulb:', ':beers:', ':speech_balloon:', ':card_file_box:', ':loud_sound:', ':mute:', ':busts_in_silhouette:', ':children_crossing:',
                    ':building_construction:', ':iphone:', ':clown_face:', ':see_no_evil:', ':camera_flash:', ':alembic:', ':mag:', ':wheel_of_dharma:', ':label:', ':seedling:', ':dizzy:',
                    ':wastebasket:', ':passport_control:', ':adhesive_bandage:', ':monocle_face:', ':coffin:', ':test_tube:', ':necktie:', ':stethoscope:', ':bricks:', ':technologist:'
                ]
            }
        }
    ]
}

function getChangelogPlugin() {
    return '@semantic-release/changelog'
}

function getNpmPlugin() {
    return '@semantic-release/npm'
}

function getGithubPlugin() {
    return '@semantic-release/github'
}

function getGitPlugin() {
    return [
        '@semantic-release/git', {
            'assets':  [
                'builds/**', 'docs/**', 'package.json', 'CHANGELOG.md'
            ],
            'message': 'chore(release): v${nextRelease.version}'
        }
    ]
}

// Configuration selection

function isDryRun() {
    return process.argv.includes( '--dry-run' )
}

function getDryRunConfig() {
    return {
        repositoryUrl: getLocalRepoUrl(),
        branches:      getCurrentBranch(),
        plugins:       [
            getGitmojiPlugin()
        ],
    }
}

function getCIConfig() {
    return {
        branch:  'master',
        plugins: [
            getGitmojiPlugin(), getChangelogPlugin(), getNpmPlugin(), getGithubPlugin(), getGitPlugin()
        ]
    }
}

// Module

export default isDryRun() ? getDryRunConfig() : getCIConfig()
