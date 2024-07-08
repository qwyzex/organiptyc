import React from 'react';
import { FileItem, FolderItem } from '@/pages/organization/[orgId]/files'; // adjust the import path as necessary

interface Props {
  item: FileItem | FolderItem | null;
  type: 'file' | 'folder' | null;
}

const FileFolderDetails: React.FC<Props> = ({ item, type }) => {
    if (!item || !type) return null;
  
    return (
      <div>
        <h3>Details</h3>
        <p><strong>Name:</strong> {item.name}</p>
        {type === 'file'  && (
          <>
            <p><strong>URL:</strong> <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a></p>
            <p><strong>Size:</strong> {item.metadata?.size} bytes</p>
            <p><strong>Content Type:</strong> {item.metadata?.contentType}</p>
            <p><strong>Created At:</strong> {new Date(item.metadata?.timeCreated).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {new Date(item.metadata?.updated).toLocaleString()}</p>
          </>
        )}
        {type === 'folder' && (
          <>
            {/* Add folder-specific details if needed */}
          </>
        )}
      </div>
    );
  };

export default FileFolderDetails;
