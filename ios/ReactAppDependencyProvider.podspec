Pod::Spec.new do |s|
  s.name                   = "ReactAppDependencyProvider"
  s.version                = "0.76.9"
  s.summary                = "React Native's dependency provider module."
  s.homepage               = "https://reactnative.dev/"
  s.license                = "MIT"
  s.author                 = "Meta Platforms, Inc. and its affiliates"
  s.platforms              = { :ios => "13.4" }
  s.source                 = { :git => "https://github.com/facebook/react-native.git", :tag => "v#{s.version}" }
  s.source_files           = "**/*.{h,m,mm,cpp}"
  s.header_dir             = "ReactAppDependencyProvider"
  
  s.dependency "React-Core"
  s.dependency "ReactCommon"
end
