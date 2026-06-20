# LibreSpeed Backend on Render

The Mypixelogs speed test frontend at `/tools/speed-test` expects a LibreSpeed-compatible backend.
The frontend does not calculate fake speeds. It calls real LibreSpeed endpoints:

- `GET /empty.php` for ping and jitter
- `GET /garbage.php?ckSize=25` for download
- `POST /empty.php` for upload

## Deploy on Render

1. Fork or create a repository from LibreSpeed:
   `https://github.com/librespeed/speedtest`
2. In Render, create a new Web Service from that repository.
3. Use the Docker deployment option.
4. Set the service region close to the audience you want to test.
5. Deploy the service and copy the public Render URL.

Example Render URL:

```txt
https://mypixelogs-speedtest.onrender.com
```

## Required Frontend Environment Variable

Add this variable to the Mypixelogs frontend deployment:

```txt
NEXT_PUBLIC_SPEEDTEST_SERVER=https://mypixelogs-speedtest.onrender.com
```

For local development, add the same value to `.env.local`.

## Connect Frontend and Backend

1. Deploy the LibreSpeed backend on Render.
2. Set `NEXT_PUBLIC_SPEEDTEST_SERVER` in Netlify or your frontend host.
3. Redeploy the Mypixelogs frontend.
4. Open `/tools/speed-test`.
5. Run the test and confirm download, upload, ping, and jitter values are populated.

## CORS

The LibreSpeed backend must allow requests from the frontend domain.
For production, allow:

```txt
https://mypixelogs.com
```

For local testing, also allow:

```txt
http://localhost:3000
```

If CORS is not configured, the speed test page will show a graceful error state with a retry button.

## Production Notes

- Use HTTPS for both frontend and backend.
- Keep the backend region close to target users for realistic results.
- Render free instances may sleep, so the first test after inactivity can be slower.
- For more stable measurements, use a paid always-on Render instance.
