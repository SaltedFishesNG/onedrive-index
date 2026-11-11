import type { OdFileObject } from '../../types'
import { FC } from 'react'
import { useRouter } from 'next/router'

import DownloadButtonGroup from '../DownloadBtnGtoup'
import { DownloadBtnContainer } from './Containers'
import { getBaseUrl } from '../../utils/getBaseUrl'
import { getStoredToken } from '../../utils/protectedRouteHandler'

const OfficePreview: FC<{ file: OdFileObject }> = ({ file }) => {
  const { asPath } = useRouter()
  const hashedToken = getStoredToken(asPath)

  const docUrl = encodeURIComponent(
    `${getBaseUrl()}/api/raw?path=${asPath}${hashedToken ? `&odpt=${hashedToken}` : ''}`,
  )

  return (
    <div>
      <div className="overflow-scroll" style={{ maxHeight: '90vh' }}>
        <iframe
          title={`Preview ${file.name}`}
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${docUrl}`}
          width="100%"
          height="600"
          frameBorder="0"
        />
      </div>
      <DownloadBtnContainer>
        <DownloadButtonGroup />
      </DownloadBtnContainer>
    </div>
  )
}

export default OfficePreview
