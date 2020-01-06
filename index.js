#!/usr/bin/env node
'use strict';

const program = require('commander')
	, fs = require('fs')
	, path = require('path')
	, execa = require('execa')
	// , params = process.argv.slice(2)
	;

function camelize(str){
	return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '');
}

function cleanArgs(cmd){
	return cmd.options.reduce((rs, o)=>{
		let key = camelize( o.long.replace(/^--/, '') )
			;

		if( typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined' ){
			rs[key] = cmd[key];
		}

		return rs;
	}, {});
}

program.version('1.0.0');

// 创建项目命令
program.command('create <app-name>')
	.description('执行了创建命令')
	// // 参数别名
	// // 添加服务器端运行环境，默认 express
	// .option('-s, --service')
	// // 添加 express 服务器端运行环境
	// .option('--express')
	// // 添加 koa 服务器端运行环境
	// .option('--koa')
	.allowUnknownOption()
	.action((name, cmd)=>{
		// 命令执行

		let options = cleanArgs( cmd )
			, cwd = options.cwd || process.cwd()
			, targetDir = path.resolve(cwd, name || '.')
			, context = {
				cwd: targetDir
			}
			// 依赖模块
			, dep = [{
				name: 'CyanMaple'
				, modules: ['cyanmaple']
			}]
			;
		let Creator = require('@vue/cli/lib/Creator')
			, { getPromptModules } = require('@vue/cli/lib/util/createTools')
			, creator = new Creator(name, targetDir, getPromptModules())
			;

		creator.on('creation', ({event})=>{
			// console.log(1, event );

			if( event === 'done' ){
				console.log('vue cli 初始化项目完成');

				console.log('添加文件夹');
				fs.mkdirSync(`${targetDir}/src/page`);
				fs.mkdirSync(`${targetDir}/src/font`);

				console.log(`安装依赖模块`);
				dep.reduce((promise, dep)=>{
					return promise.then(()=>{
						console.log(`安装 ${dep.name}`);
						return execa('npm', ['i', ...dep.modules, '--save'], context);
					});
				}, Promise.resolve());
			}
		});

		creator.create({
			...options
			, forceGit: true
			, default: true
			, router: true
		});
	})
	;

program.parse( process.argv );