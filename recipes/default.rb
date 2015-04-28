#
# Cookbook Name:: ephemeral-yum
# Recipe:: default
#
# Copyright (c) 2015 The Authors, All Rights Reserved.

package 'createrepo'
package 'nodejs'
package 'npm'

user 'yumrepo'

%w(/opt/yumrepo /opt/yumrepo/repo).each do |path|
  directory path do
    owner 'yumrepo'
    group 'yumrepo'
  end
end

remote_file '/opt/yumrepo/repo/tar-1.23-11.el6.x86_64.rpm' do
  owner 'yumrepo'
  group 'yumrepo'
  source 'ftp://195.220.108.108/linux/centos/6.6/os/x86_64/Packages/'\
         'tar-1.23-11.el6.x86_64.rpm'
end

cookbook_file 'ephemeral_yum.js' do
  path '/opt/yumrepo/ephemeral_yum.js'
  action :create
end

%w(connect serve-static).each do |package|
  npm_package package do
    path '/opt/yumrepo/'
    action :install_local
  end
end
