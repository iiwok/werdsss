import { NextResponse } from 'next/server'
import fetch from 'node-fetch'

export async function GET() {
  try {
    const pageId = process.env.INSTAGRAM_PAGE_ID
    const testImage = process.env.TEST_IMAGE_URL
    
    if (!pageId || !testImage) {
      throw new Error('Missing Instagram configuration')
    }

    // 1. First get the page details
    const pageResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account{id,username},name`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`
        }
      }
    )
    const pageData = await pageResponse.json()

    // 2. If we have an Instagram ID, try a test post
    if (pageData.instagram_business_account?.id) {
      const igId = pageData.instagram_business_account.id
      
      // First verify the image URL is accessible
      const imageResponse = await fetch(testImage)
      if (!imageResponse.ok) {
        return NextResponse.json({
          message: 'Image URL not accessible',
          status: imageResponse.status
        })
      }

      // Try to create a container
      const testPost = await fetch(
        `https://graph.facebook.com/v18.0/${igId}/media`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image_url: testImage,
            caption: 'Test post from API'
          })
        }
      )
      const postData = await testPost.json()

      // If we got a container ID, try to publish it
      if (postData.id) {
        const publishResponse = await fetch(
          `https://graph.facebook.com/v18.0/${igId}/media_publish`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              creation_id: postData.id
            })
          }
        )
        const publishData = await publishResponse.json()

        return NextResponse.json({
          message: 'Test post created',
          page: pageData,
          container: postData,
          publish: publishData
        })
      }

      return NextResponse.json({
        message: 'Container creation failed',
        page: pageData,
        postAttempt: postData
      })
    }

    return NextResponse.json({
      message: 'No Instagram account found',
      data: pageData
    })

  } catch (error) {
    return NextResponse.json({ 
      error: String(error),
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 