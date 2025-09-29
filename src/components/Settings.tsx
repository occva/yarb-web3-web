import React, { useState, useEffect } from 'react';
import { configService, GitHubRepoConfig } from '../services/configService';
import { githubApi, GitHubFile } from '../services/githubApi';
import './Settings.css';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onConfigChange }) => {
  const [config, setConfig] = useState<GitHubRepoConfig>(configService.getConfig().githubRepo);
  const [githubUrl, setGithubUrl] = useState('');
  const [availableFolders, setAvailableFolders] = useState<GitHubFile[]>([]);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 初始化时构建GitHub URL
  useEffect(() => {
    if (config.owner && config.repo) {
      let url = `https://github.com/${config.owner}/${config.repo}`;
      if (config.branch !== 'main') {
        url += `/tree/${config.branch}`;
      }
      if (config.basePath) {
        url += `/${config.basePath}`;
      }
      setGithubUrl(url);
    }
  }, []);

  // 解析GitHub URL
  const handleUrlChange = (url: string) => {
    setGithubUrl(url);
    setTestResult(null);
    setErrors([]);
    setAvailableFolders([]); // 清空文件夹列表
    
    const parsed = configService.parseGitHubUrl(url);
    if (parsed) {
      setConfig(prev => ({
        ...prev,
        ...parsed,
        selectedFolders: [] // 重置选中的文件夹
      }));
    }
  };

  // 测试连接并获取文件夹
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setErrors([]);
    
    try {
      // 验证配置
      const validationErrors = configService.validateConfig(config);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setTestResult('error');
        return;
      }

      // 测试连接
      const isValid = await githubApi.testRepoConnection(config);
      if (isValid) {
        setTestResult('success');
        // 获取文件夹列表
        await loadFolders();
      } else {
        setTestResult('error');
        setErrors(['无法连接到指定的GitHub仓库，请检查配置']);
      }
    } catch (error) {
      setTestResult('error');
      setErrors(['连接测试失败: ' + (error as Error).message]);
    } finally {
      setTesting(false);
    }
  };

  // 加载文件夹列表
  const loadFolders = async () => {
    try {
      // 临时更新配置以获取文件夹
      const tempConfig = configService.getConfig();
      configService.updateGitHubRepo(config);
      
      const folders = await githubApi.getAllFolders();
      setAvailableFolders(folders);
      
      // 默认全部勾选
      const folderNames = folders.map(folder => folder.name);
      setConfig(prev => ({
        ...prev,
        selectedFolders: folderNames
      }));
      
      // 恢复原配置
      configService.saveConfig(tempConfig);
    } catch (error) {
      console.error('加载文件夹失败:', error);
      setErrors(['获取文件夹列表失败: ' + (error as Error).message]);
    }
  };

  // 切换文件夹选择
  const toggleFolder = (folderName: string) => {
    setConfig(prev => ({
      ...prev,
      selectedFolders: prev.selectedFolders.includes(folderName)
        ? prev.selectedFolders.filter(f => f !== folderName)
        : [...prev.selectedFolders, folderName]
    }));
  };

  // 保存配置
  const handleSave = () => {
    try {
      const validationErrors = configService.validateConfig(config);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      configService.updateGitHubRepo(config);
      githubApi.forceRefresh(); // 清除缓存
      onConfigChange(); // 通知父组件配置已更改
      onClose();
    } catch (error) {
      setErrors(['保存配置失败: ' + (error as Error).message]);
    }
  };

  // 重置配置
  const handleReset = () => {
    configService.resetToDefault();
    const defaultConfig = configService.getConfig().githubRepo;
    setConfig(defaultConfig);
    setGithubUrl('');
    setAvailableFolders([]);
    setTestResult(null);
    setErrors([]);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>仓库设置</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          {/* GitHub URL 输入 */}
          <div className="form-group">
            <label>GitHub 仓库地址</label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://github.com/owner/repo/tree/branch/path"
              className="url-input"
            />
            <small className="help-text">
              支持格式：https://github.com/owner/repo 或 https://github.com/owner/repo/tree/branch/path
            </small>
          </div>

          {/* 配置详情 - 只在测试连接成功前显示 */}
          {testResult !== 'success' && (
            <div className="config-details">
              <div className="form-row">
                <div className="form-group">
                  <label>所有者</label>
                  <input
                    type="text"
                    value={config.owner}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, owner: e.target.value }));
                      setTestResult(null);
                      setAvailableFolders([]);
                    }}
                    placeholder="owner"
                  />
                </div>
                <div className="form-group">
                  <label>仓库名</label>
                  <input
                    type="text"
                    value={config.repo}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, repo: e.target.value }));
                      setTestResult(null);
                      setAvailableFolders([]);
                    }}
                    placeholder="repo"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>分支</label>
                  <input
                    type="text"
                    value={config.branch}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, branch: e.target.value }));
                      setTestResult(null);
                      setAvailableFolders([]);
                    }}
                    placeholder="main"
                  />
                </div>
                <div className="form-group">
                  <label>基础路径</label>
                  <input
                    type="text"
                    value={config.basePath}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, basePath: e.target.value }));
                      setTestResult(null);
                      setAvailableFolders([]);
                    }}
                    placeholder="docs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 测试连接按钮 */}
          <div className="test-section">
            <button 
              className="test-button"
              onClick={handleTestConnection}
              disabled={testing || !config.owner || !config.repo}
            >
              {testing ? '测试中...' : '测试连接'}
            </button>
            
            {testResult === 'success' && (
              <span className="test-result success">✓ 连接成功</span>
            )}
            {testResult === 'error' && (
              <span className="test-result error">✗ 连接失败</span>
            )}
          </div>

          {/* 连接成功后显示配置摘要 */}
          {testResult === 'success' && (
            <div className="config-summary">
              <div className="summary-item">
                <strong>仓库:</strong> {config.owner}/{config.repo}
              </div>
              <div className="summary-item">
                <strong>分支:</strong> {config.branch}
              </div>
              {config.basePath && (
                <div className="summary-item">
                  <strong>路径:</strong> {config.basePath}
                </div>
              )}
            </div>
          )}

          {/* 文件夹选择 */}
          {availableFolders.length > 0 && (
            <div className="folder-selection">
              <label>选择要展示的文件夹</label>
              <div className="folder-list">
                {availableFolders.map(folder => (
                  <label key={folder.name} className="folder-item">
                    <input
                      type="checkbox"
                      checked={config.selectedFolders.includes(folder.name)}
                      onChange={() => toggleFolder(folder.name)}
                    />
                    <span className="folder-name">{folder.name}</span>
                  </label>
                ))}
              </div>
              <small className="help-text">
                不选择任何文件夹将显示所有文件夹
              </small>
            </div>
          )}

          {/* 错误信息 */}
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <div key={index} className="error-message">{error}</div>
              ))}
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="reset-button" onClick={handleReset}>
            重置为默认
          </button>
          <div className="action-buttons">
            <button className="cancel-button" onClick={onClose}>
              取消
            </button>
            <button 
              className="save-button" 
              onClick={handleSave}
              disabled={!config.owner || !config.repo}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;