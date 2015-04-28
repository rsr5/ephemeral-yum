#
# Cookbook Name:: ephemeral-yum
# Recipe:: default
#
# Copyright (c) 2015 The Authors, All Rights Reserved.

package 'createrepo'
package 'nodejs'
package 'npm'
package 'wget'

user 'yumrepo'

%w(/opt/yumrepo /opt/yumrepo/repo).each do |path|
  directory path do
    owner 'yumrepo'
    group 'yumrepo'
  end
end

cookbook_file 'testpackage-1.0-1.x86_64.rpm' do
  owner 'yumrepo'
  group 'yumrepo'
  path '/opt/yumrepo/repo/testpackage-1.0-1.x86_64.rpm'
  action :create
end

cookbook_file 'ephemeral_yum.js' do
  owner 'yumrepo'
  group 'yumrepo'
  path '/opt/yumrepo/ephemeral_yum.js'
  action :create
end

%w(connect serve-static temp rimraf).each do |package|
  npm_package package do
    path '/opt/yumrepo/'
    action :install_local
  end
end
