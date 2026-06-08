require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'HopoffDevice'
  s.version        = package['version']
  s.summary        = 'HopOff device usage and installed-app helpers'
  s.description    = 'HopOff device usage and installed-app helpers'
  s.license        = 'MIT'
  s.author         = 'HopOff'
  s.homepage       = 'https://github.com/RishitTennis69/hopoff'
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.9'
  s.source         = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
end
